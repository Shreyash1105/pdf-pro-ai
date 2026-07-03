import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc,
  query,
  limit,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface PlatformStats {
  totalVisitsCount: number;
  activeUsersCount: number;
  totalWorkingSeconds: number;
  recentSessions: Array<{
    id: string;
    userId: string;
    email: string;
    duration: number;
    lastActive: number;
    userAgent: string;
    language: string;
    totalWorkingSeconds: number;
  }>;
}

// Global variables for local session tracking
let currentSessionId = '';
let sessionStartTime = Date.now();
let lastHeartbeatTime = Date.now();
let accumulatedWorkingSeconds = 0;
let lastInteractionTime = Date.now();

// Generate or get a unique session ID
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'sess_server';
  let sid = sessionStorage.getItem('pdf_pro_session_id');
  if (!sid) {
    sid = `sess_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem('pdf_pro_session_id', sid);
  }
  currentSessionId = sid;
  return sid;
}

// Track user's active working seconds via focus and interactions
if (typeof window !== 'undefined') {
  const trackActivity = () => {
    lastInteractionTime = Date.now();
  };
  window.addEventListener('mousemove', trackActivity);
  window.addEventListener('keydown', trackActivity);
  window.addEventListener('click', trackActivity);
  window.addEventListener('scroll', trackActivity);
}

// Helper to determine if user is active/working
function isUserActivelyWorking(): boolean {
  if (typeof document === 'undefined') return false;
  if (document.hidden || document.visibilityState !== 'visible') return false;
  // User is considered working if they interacted in the last 1 minute
  return Date.now() - lastInteractionTime < 60000;
}

// Initialize analytics tracking & setup periodic heartbeats
export function initAnalyticsTracking(userId?: string, userEmail?: string) {
  if (typeof window === 'undefined') return;

  const sid = getOrCreateSessionId();
  const uId = userId || 'anonymous';
  const email = userEmail || 'anonymous';

  // Get User Agent info
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') > -1) browser = 'Safari';
  else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (ua.indexOf('Edge') > -1) browser = 'Edge';

  const userLang = navigator.language || 'en';

  const sessionDocRef = doc(db, 'analytics_sessions', sid);

  // Initial session create/update
  const registerSession = async () => {
    try {
      await setDoc(sessionDocRef, {
        id: sid,
        userId: uId,
        email: email,
        duration: 0,
        startedAt: sessionStartTime,
        lastActive: Date.now(),
        userAgent: browser,
        language: userLang,
        totalWorkingSeconds: 0
      }, { merge: true });
    } catch (error) {
      console.warn('Silent analytics write error (ignoring for offline):', error);
    }
  };

  registerSession();

  // Periodic heartbeat: updates session duration, working seconds, and lastActive
  const heartbeatInterval = setInterval(async () => {
    const now = Date.now();
    const active = isUserActivelyWorking();

    // Calculate seconds elapsed since last heartbeat
    const elapsedSeconds = Math.round((now - lastHeartbeatTime) / 1000);
    lastHeartbeatTime = now;

    if (elapsedSeconds > 0) {
      if (active) {
        accumulatedWorkingSeconds += elapsedSeconds;
      }
    }

    const totalDuration = Math.round((now - sessionStartTime) / 1000);

    try {
      await updateDoc(sessionDocRef, {
        duration: totalDuration,
        lastActive: now,
        totalWorkingSeconds: accumulatedWorkingSeconds
      });
    } catch (error) {
      console.warn('Heartbeat error (offline or rules restricted):', error);
    }
  }, 10000); // Send heartbeat every 10 seconds

  // Clean up interval on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(heartbeatInterval);
  });
}

// Return current active session duration (for the local widget)
export function getCurrentSessionTime(): number {
  return Math.round((Date.now() - sessionStartTime) / 1000);
}

// Return current active working seconds
export function getCurrentSessionWorkingTime(): number {
  return accumulatedWorkingSeconds;
}

// Fetch global stats aggregated from Firestore
export async function fetchPlatformStats(): Promise<PlatformStats> {
  const path = 'analytics_sessions';
  try {
    const q = query(collection(db, path), orderBy('lastActive', 'desc'), limit(150));
    const querySnapshot = await getDocs(q);
    
    const sessions: PlatformStats['recentSessions'] = [];
    let totalVisitsCount = 0;
    let activeUsersCount = 0;
    let totalWorkingSeconds = 0;
    
    const now = Date.now();
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const lastActive = data.lastActive || now;
      const duration = data.duration || 0;
      const totalWork = data.totalWorkingSeconds || 0;
      
      totalVisitsCount++;
      totalWorkingSeconds += totalWork;
      
      // Consider user active if they sent a heartbeat within the last 2 minutes
      if (now - lastActive < 120000) {
        activeUsersCount++;
      }
      
      sessions.push({
        id: data.id || docSnap.id,
        userId: data.userId || 'anonymous',
        email: data.email || 'anonymous',
        duration,
        lastActive,
        userAgent: data.userAgent || 'Unknown',
        language: data.language || 'en',
        totalWorkingSeconds: totalWork
      });
    });

    // Fallbacks to avoid 0 if database query is empty
    return {
      totalVisitsCount: Math.max(totalVisitsCount, 1),
      activeUsersCount: Math.max(activeUsersCount, 1),
      totalWorkingSeconds: Math.max(totalWorkingSeconds, 15),
      recentSessions: sessions
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return {
      totalVisitsCount: 1,
      activeUsersCount: 1,
      totalWorkingSeconds: 0,
      recentSessions: []
    };
  }
}
