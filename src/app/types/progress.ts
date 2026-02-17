export type ProgressStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface CompletionRules {
  minAttendancePct: number;
  minVideoPct: number;
  minTestScorePct: number;
}

export interface StudentCourseProgress {
  attendancePct: number;
  videoCompletionPct: number;
  bestTestScorePct: number;
  status: ProgressStatus;
  completedAt?: string | null;
  rules: CompletionRules;
}

export interface TeacherStudentProgressRow {
  studentId: number;
  fullName: string;
  attendancePct: number;
  videoCompletionPct: number;
  bestTestScorePct: number;
  status: ProgressStatus;
  completedAt?: string | null;
  updatedAt?: string;
}

export interface TeacherCourseProgressResponse {
  courseId: number;
  students: TeacherStudentProgressRow[];
  page: number;
  size: number;
  total: number;
}

export interface CompletionRulesUpdateRequest {
  minAttendancePct: number;
  minVideoPct: number;
  minTestScorePct: number;
}

export interface RecalcProgressResponse {
  total: number;
  updatedCompleted: number;
  updatedInProgress: number;
}
