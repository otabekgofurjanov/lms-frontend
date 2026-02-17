import type { CourseStatus, LessonType } from '@/app/types/courses';

export type EnrollmentStatus = 'ACTIVE' | 'PAUSED' | 'REMOVED';

export interface EnrollmentStudent {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  status: 'ACTIVE' | 'BLOCKED' | 'DELETED';
}

export interface EnrollmentListItem {
  enrollmentId: number;
  courseId: number;
  enrollmentStatus: EnrollmentStatus;
  enrolledAt: string;
  student: EnrollmentStudent;
}

export interface BulkEnrollRequest {
  studentIds: number[];
}

export interface BulkEnrollResult {
  total: number;
  created: number;
  reactivated: number;
  skipped: number;
  failed: number;
  errors: string[];
}

export interface StudentCourseListItem {
  courseId: number;
  title: string;
  coverUrl?: string;
  status: CourseStatus;
  enrolledAt: string;
}

export interface StudentCourseLesson {
  id: number;
  title: string;
  lessonType: LessonType;
  sortOrder: number;
  availableAt?: string;
}

export interface StudentCourseModule {
  id: number;
  title: string;
  sortOrder: number;
  lessons: StudentCourseLesson[];
}

export interface StudentCourseDetail {
  courseId: number;
  title: string;
  coverUrl?: string;
  status: CourseStatus;
  modules: StudentCourseModule[];
}

export interface EnrollmentListQuery {
  page: number;
  size: number;
  search?: string;
}

export interface EnrollmentListResult {
  items: EnrollmentListItem[];
  total: number;
  page: number;
  size: number;
}

export interface StudentCoursesResult {
  items: StudentCourseListItem[];
  total: number;
  page: number;
  size: number;
}
