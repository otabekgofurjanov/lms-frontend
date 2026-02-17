export type VideoStatus = 'READY' | 'PENDING' | 'FAILED';

export interface LessonVideoResponse {
  status: VideoStatus;
  videoUrl?: string;
  expiresInSeconds?: number;
  checksumSha256?: string;
}

export interface VideoSessionResponse {
  sessionId: string;
  lessonId: number;
  serverTime: string;
  requiredCompletionPct: number;
}

export interface VideoProgressEventRequest {
  sessionId: string;
  currentSecond: number;
  watchedDeltaSeconds: number;
  totalSeconds: number;
  eventTime: string;
  tabVisible: boolean;
  tabSwitchCountDelta: number;
  seekAttemptDelta: number;
}

export interface VideoProgressResponse {
  accepted: boolean;
  completionPct: number;
  canUnlockQuiz: boolean;
}

export interface VideoProgressSnapshot {
  watchedSeconds: number;
  totalSeconds: number;
  completionPct: number;
  suspiciousFlags?: Record<string, unknown>;
  lastEventAt?: string;
}
