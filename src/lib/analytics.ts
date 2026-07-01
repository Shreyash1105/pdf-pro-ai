import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where,
  getCountFromServer,
  Timestamp,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';

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
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || 'anonymous',
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous ?? true,
    },
    operationType,
    path
  };
  console.warn('Firestore Analytics (Graceful Fallback): ', JSON.stringify(errInfo));
}

// Session Tracking Variables
let currentSessionId = '';
let sessionStartTime = Date.now();
let lastActiveTime = Date.now();
let currentDuration = 0; // in seconds
let isTracking = false;
let trackedUserId = '';

// Generate or retrieve session ID
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let id = sessionStorage.getItem('pdf_pro_session_id');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    sessionStorage.setItem('pdf_pro_session_id', id);
    sessionStorage.setItem('pdf_pro_session_start_time', String(Date.now()));
  }
  
  currentSessionId = id;
  const storedStart = sessionStorage.getItem('pdf_pro_session_start_time');
  if (storedStart) {
    sessionStartTime = parseInt(storedStart, 10);
    // Calculate accumulated duration from start
    currentDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
  }
  
  return id;
}

// Format browser name nicely
function getBrowserInfo(): string {
  if (typeof navigator === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Chromium') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  return 'Web Browser';
}

// Start tracking loop
export function initAnalyticsTracking(userId?: string) {
  if (typeof window === 'undefined') return;
  
  const targetUid = userId || auth.currentUser?.uid || 'anonymous';
  
  if (isTracking) {
    if (trackedUserId !== targetUid) {
      trackedUserId = targetUid;
      setDoc(doc(db, 'analytics_sessions', currentSessionId), {
        userId: targetUid,
        updatedAt: Date.now()
      }, { merge: true })
      .catch((error) => {
        console.warn('Silent analytics update failed on auth change: ', error);
      });
    }
    return;
  }
  
  isTracking = true;
  trackedUserId = targetUid;
  getOrCreateSessionId();
  
  const browser = getBrowserInfo();
  const lang = navigator.language || 'en';
  
  // 1. Log or update the initial session document
  const logSession = async () => {
    const path = `analytics_sessions/${currentSessionId}`;
    try {
      await setDoc(doc(db, 'analytics_sessions', currentSessionId), {
        id: currentSessionId,
        userId: targetUid,
        startTime: sessionStartTime,
        lastActive: Date.now(),
        duration: currentDuration,
        userAgent: browser,
        language: lang,
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };
  
  logSession();
  
  // 2. Set up interval to increment duration and update activity
  const intervalId = setInterval(() => {
    currentDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    
    const uid = auth.currentUser?.uid || 'anonymous';
    const path = `analytics_sessions/${currentSessionId}`;
    
    // Update active session duration and timestamp in Firestore
    setDoc(doc(db, 'analytics_sessions', currentSessionId), {
      id: currentSessionId,
      userId: uid,
      startTime: sessionStartTime,
      lastActive: Date.now(),
      duration: currentDuration,
      userAgent: browser,
      language: lang,
      updatedAt: Date.now()
    }, { merge: true })
    .catch((error) => {
      console.warn('Silent analytics update failed: ', error);
    });
  }, 10000); // every 10 seconds
  
  // Clean up on beforeunload
  window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
  });
}

export function getCurrentSessionTime(): number {
  return Math.floor((Date.now() - sessionStartTime) / 1000);
}

// Fetch all sessions to calculate aggregates
export interface PlatformStats {
  totalVisitsCount: number;
  activeUsersCount: number;
  totalWorkingSeconds: number;
  recentSessions: Array<{
    id: string;
    userId: string;
    duration: number;
    lastActive: number;
    userAgent: string;
    language: string;
  }>;
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const sessionsCollection = collection(db, 'analytics_sessions');
  const path = 'analytics_sessions';
  
  try {
    // 1. Get total visits count (using optimized getCountFromServer)
    const countSnapshot = await getCountFromServer(sessionsCollection);
    const totalVisitsCount = countSnapshot.data().count;
    
    // 2. Query last 150 sessions to calculate other metrics and display latest activity
    const statsQuery = query(
      sessionsCollection,
      orderBy('lastActive', 'desc'),
      limit(150)
    );
    
    const querySnapshot = await getDocs(statsQuery);
    const sessionsList: any[] = [];
    let activeUsersCount = 0;
    let totalWorkingSeconds = 0;
    
    const now = Date.now();
    const activeThresholdMs = 2 * 60 * 1000; // 2 minutes
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sessionsList.push(data);
      
      // Calculate active users right now
      if (now - data.lastActive < activeThresholdMs) {
        activeUsersCount++;
      }
      
      // Sum durations
      totalWorkingSeconds += (data.duration || 0);
    });
    
    // Fallback: If total visits count from getCountFromServer was 0 or failed, use local size
    const finalTotalVisits = Math.max(totalVisitsCount, sessionsList.length);
    
    // Ensure active users is at least 1 (the current user)
    const finalActiveUsers = Math.max(activeUsersCount, 1);
    
    // Format sessions for recent display
    const recentSessions = sessionsList.map(s => ({
      id: s.id,
      userId: s.userId || 'anonymous',
      duration: s.duration || 0,
      lastActive: s.lastActive || Date.now(),
      userAgent: s.userAgent || 'Web Browser',
      language: s.language || 'en'
    }));
    
    return {
      totalVisitsCount: finalTotalVisits,
      activeUsersCount: finalActiveUsers,
      totalWorkingSeconds: Math.max(totalWorkingSeconds, currentDuration),
      recentSessions
    };
  } catch (error) {
    // Return empty stats if table doesn't exist yet, or other read issues
    console.warn('Error fetching analytics stats, using mock/local stats fallback: ', error);
    return {
      totalVisitsCount: 1,
      activeUsersCount: 1,
      totalWorkingSeconds: currentDuration,
      recentSessions: [{
        id: currentSessionId || 'sess_local',
        userId: auth.currentUser?.uid || 'anonymous',
        duration: currentDuration,
        lastActive: Date.now(),
        userAgent: getBrowserInfo(),
        language: typeof navigator !== 'undefined' ? (navigator.language || 'en') : 'en'
      }]
    };
  }
}
