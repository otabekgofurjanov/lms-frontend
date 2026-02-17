import type {
  CourseModule,
  CreateModuleRequest,
  ReorderModulesRequest,
  UpdateModuleRequest,
} from '@/app/types/courses';

import { http } from './http';

export const modulesApi = {
  listModules(courseId: number) {
    return http.get<CourseModule[]>(`/api/courses/${courseId}/modules`);
  },
  createModule(courseId: number, payload: CreateModuleRequest) {
    return http.post<CourseModule>(`/api/courses/${courseId}/modules`, payload);
  },
  updateModule(moduleId: number, payload: UpdateModuleRequest) {
    return http.put<CourseModule>(`/api/modules/${moduleId}`, payload);
  },
  deleteModule(moduleId: number) {
    return http.delete<void>(`/api/modules/${moduleId}`);
  },
  reorderModules(courseId: number, moduleIdsInOrder: ReorderModulesRequest['moduleIdsInOrder']) {
    return http.post<void>(`/api/courses/${courseId}/modules/reorder`, { moduleIdsInOrder });
  },
};
