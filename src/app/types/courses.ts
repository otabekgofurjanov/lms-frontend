export type CourseStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type LessonType = 'LIVE_ZOOM' | 'RECORDED';

export interface CourseListItem {
  id: number;
  title: string;
  description?: string;
  coverUrl?: string;
  status: CourseStatus;
  createdBy: string;
  createdAt: string;
}

export interface Lesson {
  id: number;
  moduleId: number;
  title: string;
  lessonType: LessonType;
  sortOrder: number;
  availableAt?: string;
}

export interface CourseModule {
  id: number;
  courseId: number;
  title: string;
  sortOrder: number;
  lessons?: Lesson[];
}

export interface CourseDetail {
  id: number;
  title: string;
  description?: string;
  coverUrl?: string;
  status: CourseStatus;
  modules: CourseModule[];
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  coverUrl?: string;
}

export interface UpdateCourseRequest {
  title: string;
  description?: string;
  coverUrl?: string;
}

export interface UpdateCourseStatusRequest {
  status: CourseStatus;
}

export interface CreateModuleRequest {
  title: string;
}

export interface UpdateModuleRequest {
  title: string;
}

export interface ReorderModulesRequest {
  moduleIdsInOrder: number[];
}

export interface CreateLessonRequest {
  title: string;
  lessonType: LessonType;
  availableAt?: string;
}

export interface UpdateLessonRequest {
  title: string;
  lessonType: LessonType;
  availableAt?: string;
}

export interface ReorderLessonsRequest {
  lessonIdsInOrder: number[];
}

export interface ListCoursesQuery {
  page: number;
  size: number;
  search?: string;
  status?: CourseStatus;
}

export interface ListCoursesResult {
  items: CourseListItem[];
  total: number;
  page: number;
  size: number;
}
