// Analytics tracking completely disabled as requested by user.

export function getOrCreateSessionId(): string {
  return 'sess_local';
}

export function initAnalyticsTracking(userId?: string) {
  // No-op: Telemetry collection completely disabled
}

export function getCurrentSessionTime(): number {
  return 0;
}

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
  return {
    totalVisitsCount: 1,
    activeUsersCount: 1,
    totalWorkingSeconds: 0,
    recentSessions: []
  };
}
