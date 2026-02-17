export type MeetingAttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'UNKNOWN';

export interface TeacherAttendanceRow {
  studentId: number;
  fullName: string;
  attendancePct: number;
  lastMeetingStatus?: MeetingAttendanceStatus;
  lastMeetingDurationSeconds?: number;
}

export interface TeacherAttendanceResponse {
  courseId: number;
  meetingsSummary?: {
    totalMeetings?: number;
    averageAttendancePct?: number;
  };
  students: TeacherAttendanceRow[];
  page: number;
  size: number;
  total: number;
}

export interface StudentMeetingAttendanceItem {
  meetingId: number;
  lessonTitle: string;
  status: MeetingAttendanceStatus;
  durationSeconds: number;
}

export interface StudentAttendanceResponse {
  courseId: number;
  attendancePct: number;
  meetings: StudentMeetingAttendanceItem[];
}
