import type {
  BulkEnrollRequest,
  BulkEnrollResult,
  EnrollmentListQuery,
  EnrollmentListResult,
  EnrollmentListItem,
  EnrollmentStatus,
  StudentCourseDetail,
  StudentCourseListItem,
  StudentCoursesResult,
} from '@/app/types/enrollment';

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

const normalizePage = <T>(payload: PageableResponse<T> | T[], page: number, size: number) => {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      total: payload.length,
      page,
      size,
    };
  }

  return {
    items: payload.content ?? payload.items ?? [],
    total: payload.totalElements ?? payload.total ?? 0,
    page: payload.number ?? payload.page ?? page,
    size: payload.size ?? size,
  };
};

export const enrollmentApi = {
  async adminListEnrollments(courseId: number, params: EnrollmentListQuery): Promise<EnrollmentListResult> {
    const payload = await http.get<PageableResponse<EnrollmentListItem> | EnrollmentListItem[]>(
      `/api/admin/courses/${courseId}/enrollments`,
      { params },
    );
    return normalizePage(payload, params.page, params.size);
  },
  adminBulkEnroll(courseId: number, studentIds: BulkEnrollRequest['studentIds']) {
    return http.post<BulkEnrollResult>(`/api/admin/courses/${courseId}/enrollments`, { studentIds });
  },
  adminUpdateEnrollmentStatus(enrollmentId: number, status: EnrollmentStatus) {
    return http.patch<void>(`/api/admin/enrollments/${enrollmentId}/status`, { status });
  },
  adminRemoveEnrollment(enrollmentId: number) {
    return http.delete<void>(`/api/admin/enrollments/${enrollmentId}`);
  },
  async teacherListStudents(courseId: number, params: EnrollmentListQuery): Promise<EnrollmentListResult> {
    const payload = await http.get<PageableResponse<EnrollmentListItem> | EnrollmentListItem[]>(
      `/api/teacher/courses/${courseId}/students`,
      { params },
    );
    return normalizePage(payload, params.page, params.size);
  },
  async studentMyCourses(params: { page: number; size: number }): Promise<StudentCoursesResult> {
    const payload = await http.get<PageableResponse<StudentCourseListItem> | StudentCourseListItem[]>(
      '/api/student/courses',
      { params },
    );
    return normalizePage(payload, params.page, params.size);
  },
  studentCourseDetail(courseId: number) {
    return http.get<StudentCourseDetail>(`/api/student/courses/${courseId}`);
  },
};
