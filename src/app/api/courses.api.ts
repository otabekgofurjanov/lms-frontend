import type {
  CourseDetail,
  CourseListItem,
  CreateCourseRequest,
  ListCoursesQuery,
  ListCoursesResult,
  UpdateCourseRequest,
  UpdateCourseStatusRequest,
} from '@/app/types/courses';

import { http } from './http';

interface PageableResponse {
  content?: CourseListItem[];
  totalElements?: number;
  number?: number;
  size?: number;
  items?: CourseListItem[];
  total?: number;
  page?: number;
}

const normalizeListResponse = (payload: PageableResponse | CourseListItem[], query: ListCoursesQuery): ListCoursesResult => {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      total: payload.length,
      page: query.page,
      size: query.size,
    };
  }

  return {
    items: payload.content ?? payload.items ?? [],
    total: payload.totalElements ?? payload.total ?? 0,
    page: payload.number ?? payload.page ?? query.page,
    size: payload.size ?? query.size,
  };
};

export const coursesApi = {
  async listCourses(params: ListCoursesQuery): Promise<ListCoursesResult> {
    const payload = await http.get<PageableResponse | CourseListItem[]>('/api/courses', { params });
    return normalizeListResponse(payload, params);
  },
  getCourse(id: number) {
    return http.get<CourseDetail>(`/api/courses/${id}`);
  },
  createCourse(payload: CreateCourseRequest) {
    return http.post<CourseDetail>('/api/courses', payload);
  },
  updateCourse(id: number, payload: UpdateCourseRequest) {
    return http.put<CourseDetail>(`/api/courses/${id}`, payload);
  },
  updateCourseStatus(id: number, status: UpdateCourseStatusRequest['status']) {
    return http.patch<CourseDetail>(`/api/courses/${id}/status`, { status });
  },
};
