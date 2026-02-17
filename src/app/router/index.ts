import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import { authGuard } from '@/guards/auth.guard';
import { useAuthStore } from '@/app/store/auth.store';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/auth/LoginPage.vue'),
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['ADMIN'] },
    children: [
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('@/pages/admin/AdminDashboard.vue'),
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/pages/admin/users/UsersListPage.vue'),
      },
      {
        path: 'enrollment',
        name: 'admin-enrollment-courses',
        component: () => import('@/pages/admin/enrollment/EnrollmentCoursesPage.vue'),
      },
      {
        path: 'courses/:courseId/enrollments',
        name: 'admin-course-enrollments',
        component: () => import('@/pages/admin/enrollment/AdminEnrollmentsPage.vue'),
      },
      {
        path: 'courses/:courseId/attendance-ops',
        name: 'admin-attendance-ops',
        component: () => import('@/pages/admin/attendance/AdminAttendanceOpsPage.vue'),
      },
      {
        path: 'courses',
        name: 'admin-courses',
        component: () => import('@/pages/admin/courses/CoursesListPage.vue'),
      },
      {
        path: 'courses/:id',
        name: 'admin-course-builder',
        component: () => import('@/pages/admin/courses/CourseBuilderPage.vue'),
      },

      {
        path: 'courses/:courseId/exam/quizzes',
        name: 'admin-exam-quizzes',
        component: () => import('@/pages/admin/exam/AdminQuizzesPage.vue'),
      },
      {
        path: 'courses/:courseId/exam/questions',
        name: 'admin-exam-questions',
        component: () => import('@/pages/admin/exam/AdminQuestionsPage.vue'),
      },
      {
        path: 'courses/:courseId/exam/quizzes/:id',
        name: 'admin-exam-quiz-builder',
        component: () => import('@/pages/admin/exam/AdminQuizBuilderPage.vue'),
      },

      {
        path: 'courses/:courseId/completion',
        name: 'admin-completion-rules',
        component: () => import('@/pages/admin/progress/AdminCompletionRulesPage.vue'),
      },
      {
        path: 'courses/:courseId/progress',
        name: 'admin-course-progress-ops',
        component: () => import('@/pages/admin/progress/AdminCourseProgressOpsPage.vue'),
      },
    ],
  },
  {
    path: '/teacher',
    component: () => import('@/layouts/TeacherLayout.vue'),
    meta: { requiresAuth: true, roles: ['TEACHER'] },
    children: [
      {
        path: 'dashboard',
        name: 'teacher-dashboard',
        component: () => import('@/pages/teacher/TeacherDashboard.vue'),
      },
      {
        path: 'courses',
        name: 'teacher-courses',
        component: () => import('@/pages/teacher/courses/CoursesListPage.vue'),
      },
      {
        path: 'courses/:id',
        name: 'teacher-course-builder',
        component: () => import('@/pages/teacher/courses/CourseBuilderPage.vue'),
      },
      {
        path: 'courses/:courseId/students',
        name: 'teacher-course-students',
        component: () => import('@/pages/teacher/students/TeacherStudentsPage.vue'),
      },
      {
        path: 'courses/:courseId/attendance',
        name: 'teacher-course-attendance',
        component: () => import('@/pages/teacher/attendance/TeacherCourseAttendancePage.vue'),
      },
      {
        path: 'lessons/:lessonId/zoom',
        name: 'teacher-lesson-zoom',
        component: () => import('@/pages/teacher/zoom/TeacherLessonZoomPage.vue'),
      },

      {
        path: 'courses/:courseId/exam/quizzes',
        name: 'teacher-exam-quizzes',
        component: () => import('@/pages/teacher/exam/TeacherQuizzesPage.vue'),
      },
      {
        path: 'courses/:courseId/exam/questions',
        name: 'teacher-exam-questions',
        component: () => import('@/pages/teacher/exam/TeacherQuestionsPage.vue'),
      },
      {
        path: 'courses/:courseId/exam/quizzes/:id',
        name: 'teacher-exam-quiz-builder',
        component: () => import('@/pages/teacher/exam/TeacherQuizBuilderPage.vue'),
      },

      {
        path: 'courses/:courseId/progress',
        name: 'teacher-course-progress',
        component: () => import('@/pages/teacher/progress/TeacherCourseProgressPage.vue'),
      },
    ],
  },
  {
    path: '/student',
    component: () => import('@/layouts/StudentLayout.vue'),
    meta: { requiresAuth: true, roles: ['STUDENT'] },
    children: [
      {
        path: 'dashboard',
        name: 'student-dashboard',
        component: () => import('@/pages/student/StudentDashboard.vue'),
      },
      {
        path: 'courses',
        name: 'student-courses',
        component: () => import('@/pages/student/courses/StudentMyCoursesPage.vue'),
      },
      {
        path: 'courses/:courseId',
        name: 'student-course-detail',
        component: () => import('@/pages/student/courses/StudentCourseDetailPage.vue'),
      },
      {
        path: 'courses/:courseId/attendance',
        name: 'student-course-attendance',
        component: () => import('@/pages/student/attendance/StudentCourseAttendancePage.vue'),
      },
      {
        path: 'lessons/:lessonId/join',
        name: 'student-lesson-join',
        component: () => import('@/pages/student/zoom/StudentJoinLessonPage.vue'),
      },

      {
        path: 'lessons/:lessonId/video',
        name: 'student-lesson-video',
        component: () => import('@/pages/student/video/StudentLessonVideoPage.vue'),
      },

      {
        path: 'courses/:courseId/quizzes',
        name: 'student-quizzes',
        component: () => import('@/pages/student/exam/StudentQuizzesPage.vue'),
      },

      {
        path: 'courses/:courseId/progress',
        name: 'student-course-progress',
        component: () => import('@/pages/student/progress/StudentCourseProgressPage.vue'),
      },
      {
        path: 'quizzes/:quizId/start',
        name: 'student-quiz-start',
        component: () => import('@/pages/student/exam/StudentQuizAttemptPage.vue'),
      },
      {
        path: 'quizzes/:quizId/result/:attemptId',
        name: 'student-quiz-result',
        component: () => import('@/pages/student/exam/StudentQuizResultPage.vue'),
      },
      {
        path: 'quizzes/:quizId/attempts',
        name: 'student-quiz-attempts',
        component: () => import('@/pages/student/exam/StudentQuizAttemptsPage.vue'),
      },
    ],
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/pages/ForbiddenPage.vue'),
  },
  {
    path: '/not-found',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
  },

  {
    path: '/verify/certificate/:serial',
    name: 'public-certificate-verify',
    component: () => import('@/pages/public/certificates/PublicCertificateVerifyPage.vue'),
  },
  {
    path: '/',
    name: 'root',
    beforeEnter: async () => {
      const authStore = useAuthStore();
      await authStore.initialize();
      if (!authStore.isAuthenticated) {
        return '/login';
      }
      if (authStore.hasRole('ADMIN')) return '/admin/dashboard';
      if (authStore.hasRole('TEACHER')) return '/teacher/dashboard';
      if (authStore.hasRole('STUDENT')) return '/student/dashboard';
      return '/forbidden';
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/not-found',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(authGuard);

export default router;
