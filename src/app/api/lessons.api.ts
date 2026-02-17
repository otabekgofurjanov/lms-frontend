import type {
  CreateLessonRequest,
  Lesson,
  ReorderLessonsRequest,
  UpdateLessonRequest,
} from '@/app/types/courses';

import { http } from './http';

export const lessonsApi = {
  listLessons(moduleId: number) {
    return http.get<Lesson[]>(`/api/modules/${moduleId}/lessons`);
  },
  createLesson(moduleId: number, payload: CreateLessonRequest) {
    return http.post<Lesson>(`/api/modules/${moduleId}/lessons`, payload);
  },
  updateLesson(lessonId: number, payload: UpdateLessonRequest) {
    return http.put<Lesson>(`/api/lessons/${lessonId}`, payload);
  },
  deleteLesson(lessonId: number) {
    return http.delete<void>(`/api/lessons/${lessonId}`);
  },
  reorderLessons(moduleId: number, lessonIdsInOrder: ReorderLessonsRequest['lessonIdsInOrder']) {
    return http.post<void>(`/api/modules/${moduleId}/lessons/reorder`, { lessonIdsInOrder });
  },
};
