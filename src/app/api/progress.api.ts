import type {
  CompletionRules,
  CompletionRulesUpdateRequest,
  RecalcProgressResponse,
  StudentCourseProgress,
  TeacherCourseProgressResponse,
  TeacherStudentProgressRow,
} from '@/app/types/progress';

import { http } from './http';

interface PageableResponse<T> {
  content?: T[];
  totalElements?: number;
  number?: number;
  size?: number;
  items?: T[];
  total?: number;
  page?: number;
}

export const progressApi = {
  studentCourseProgress(courseId: number) {
    return http.get<StudentCourseProgress>(`/api/student/courses/${courseId}/progress`);
  },
  async teacherCourseProgress(
    courseId: number,
    params: { page: number; size: number; search?: string },
  ): Promise<TeacherCourseProgressResponse> {
    const payload = await http.get<PageableResponse<TeacherStudentProgressRow> | TeacherCourseProgressResponse>(
      `/api/teacher/courses/${courseId}/progress`,
      { params },
    );

    if ('students' in payload) {
      return payload;
    }

    return {
      courseId,
      students: payload.content ?? payload.items ?? [],
      total: payload.totalElements ?? payload.total ?? 0,
      page: payload.number ?? payload.page ?? params.page,
      size: payload.size ?? params.size,
    };
  },
  adminGetCompletionRules(courseId: number) {
    return http.get<CompletionRules>(`/api/admin/courses/${courseId}/completion-rules`);
  },
  adminUpdateCompletionRules(courseId: number, payload: CompletionRulesUpdateRequest) {
    return http.put<CompletionRules>(`/api/admin/courses/${courseId}/completion-rules`, payload);
  },
  adminRecalculateProgress(courseId: number) {
    return http.post<RecalcProgressResponse>(`/api/admin/courses/${courseId}/recalculate-progress`);
  },
};
