import type { StudentAttendanceResponse, TeacherAttendanceResponse } from '@/app/types/attendance';

import { http } from './http';

export const attendanceApi = {
  teacherCourseAttendance(courseId: number, params: { page: number; size: number; search?: string }) {
    return http.get<TeacherAttendanceResponse>(`/api/teacher/courses/${courseId}/attendance`, { params });
  },
  studentCourseAttendance(courseId: number) {
    return http.get<StudentAttendanceResponse>(`/api/student/courses/${courseId}/attendance`);
  },
  adminRecalcMeeting(meetingId: number) {
    return http.post<void>(`/api/admin/zoom/meetings/${meetingId}/recalculate-attendance`);
  },
  adminRecalcCourse(courseId: number) {
    return http.post<void>(`/api/admin/courses/${courseId}/recalculate-attendance`);
  },
};
