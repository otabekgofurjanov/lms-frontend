# LMS Frontend (Foundation + Backend Integration)

Vue 3 + TypeScript asosida ichki LMS uchun frontend.

## Stack

- Vue 3 + Vite
- TypeScript
- Element Plus
- Vue Router
- Pinia
- Axios
- VueUse
- ESLint + Prettier

## Setup

1. Install dependencies:

```bash
npm install
```

2. Environment fayl yarating:

```bash
cp .env.example .env
```

3. `.env` ichida backend URL sozlang:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=LMS
```

4. Development server:

```bash
npm run dev
```

## Scripts

- `npm run dev` – local development
- `npm run build` – production build
- `npm run preview` – preview build
- `npm run lint` – eslint check
- `npm run format` – prettier format

## Backend moslik

Quyidagi endpointlar bilan ishlaydi:

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Backend response format:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "timestamp": "...",
  "requestId": "..."
}
```

## Auth flow

- `accessToken`: faqat memory (Pinia store)
- `refreshToken`: `localStorage` (`lms_refresh_token`)
- 401 holatda axios interceptor refresh qiladi
- parallel 401 so'rovlar uchun queue pattern ishlatilgan
- refresh muvaffaqiyatsiz bo'lsa logout va `/login`

## Manual smoke test

1. `npm install`
2. `.env` sozlash (`VITE_API_BASE_URL`)
3. `npm run dev`
4. `/login` -> `admin@local` / `Admin123!`
5. Login success -> `/admin/dashboard`
6. F5 reload -> refresh token bilan session tiklanadi
7. Student bilan `/admin/dashboard` -> `/forbidden`

## Local default credentials

- Email: `admin@local`
- Password: `Admin123!`

> Faqat local development uchun.

## Admin Users Management (Phase 2)

Implemented `/admin/users` module with backend-aligned admin user management:

- list users with pagination + debounced search
- create user
- edit user
- block/unblock with confirmation
- view user drawer
- CSV import (`multipart/form-data`) with summary (`total/created/updated/failed/errors`)
- roles loaded dynamically from `GET /api/admin/roles`

Additional backend endpoints used:

- `POST /api/admin/users`
- `PUT /api/admin/users/{id}`
- `PATCH /api/admin/users/{id}/status`
- `GET /api/admin/users?page=&size=&search=`
- `GET /api/admin/users/{id}`
- `POST /api/admin/users/import`
- `GET /api/admin/roles`
- `GET /api/admin/permissions` (optional)

## Course Builder (Phase 3)

Implemented Course Builder UI for both ADMIN and TEACHER:

- `/admin/courses`, `/admin/courses/:id`
- `/teacher/courses`, `/teacher/courses/:id`

Capabilities:

- Course list with search, status filter, pagination
- Course create/edit/status change
- Builder page with module CRUD + lesson CRUD
- Drag & drop reorder for modules and lessons with backend sync
- Optimistic reorder + revert on backend failure
- Loading skeletons, confirmations and notifications

Phase 3 backend endpoints integrated:

- `POST /api/courses`
- `PUT /api/courses/{id}`
- `PATCH /api/courses/{id}/status`
- `GET /api/courses?page=&size=&search=&status=`
- `GET /api/courses/{id}`
- `POST /api/courses/{courseId}/modules`
- `PUT /api/modules/{moduleId}`
- `DELETE /api/modules/{moduleId}`
- `POST /api/courses/{courseId}/modules/reorder`
- `GET /api/courses/{courseId}/modules`
- `POST /api/modules/{moduleId}/lessons`
- `PUT /api/lessons/{lessonId}`
- `DELETE /api/lessons/{lessonId}`
- `POST /api/modules/{moduleId}/lessons/reorder`
- `GET /api/modules/{moduleId}/lessons`

## Enrollment Management (Phase 4)

Implemented enrollment features across all roles:

### Admin
- `/admin/enrollment` (course selection)
- `/admin/courses/:courseId/enrollments` (manage enrollments)
- List/search/pagination for enrollments
- Bulk enroll with student search + selection + result summary
- Enrollment status update (`ACTIVE`, `PAUSED`, `REMOVED`)
- Remove enrollment action

### Teacher
- `/teacher/courses/:courseId/students` read-only students list
- Search + pagination

### Student
- `/student/courses` my courses list
- `/student/courses/:courseId` course detail with modules/lessons
- 403 on detail redirects back to `/student/courses`

Phase 4 backend endpoints integrated:

- `POST /api/admin/courses/{courseId}/enrollments`
- `GET /api/admin/courses/{courseId}/enrollments`
- `PATCH /api/admin/enrollments/{enrollmentId}/status`
- `DELETE /api/admin/enrollments/{enrollmentId}`
- `GET /api/teacher/courses/{courseId}/students`
- `GET /api/student/courses`
- `GET /api/student/courses/{courseId}`

## Zoom + Attendance (Phase 5)

Implemented Zoom scheduling/join and attendance reporting UI for Teacher/Student (+ Admin ops):

### Teacher
- `/teacher/lessons/:lessonId/zoom`
  - Connect Zoom (`GET /api/zoom/connect-url`)
  - Disconnect Zoom (`POST /api/zoom/disconnect`)
  - Create lesson meeting (`POST /api/lessons/{lessonId}/zoom-meeting`)
  - Show meeting details (`GET /api/lessons/{lessonId}/zoom-meeting`)
- `/teacher/courses/:courseId/attendance`
  - Attendance table + KPI + search/pagination

### Student
- `/student/lessons/:lessonId/join`
  - Join link (`GET /api/student/lessons/{lessonId}/join-link`)
- `/student/courses/:courseId/attendance`
  - Personal attendance report

### Admin (ops)
- `/admin/courses/:courseId/attendance-ops`
  - Recalculate course attendance
  - Recalculate meeting attendance

Phase 5/6 endpoints integrated:

- `POST /api/lessons/{lessonId}/zoom-meeting`
- `GET /api/lessons/{lessonId}/zoom-meeting`
- `GET /api/zoom/connect-url`
- `POST /api/zoom/disconnect`
- `GET /api/student/lessons/{lessonId}/join-link`
- `GET /api/teacher/courses/{courseId}/attendance`
- `GET /api/student/courses/{courseId}/attendance`
- `POST /api/admin/zoom/meetings/{meetingId}/recalculate-attendance`
- `POST /api/admin/courses/{courseId}/recalculate-attendance`

## Video Player + Progress (Phase 6)

Implemented secure recorded-video flow for students with backend-integrated progress/session tracking:

### Student video route
- `/student/lessons/:lessonId/video`

### Capabilities
- Video access status handling (`READY`, `PENDING`, `FAILED`)
- Video session creation on open
- Progress snapshot loading and resume from watched position
- Progress ping every ~5s with tab visibility + seek attempt deltas
- Tab hidden => video auto pause + warning overlay
- Forward seek attempt blocking + revert + backend signal
- Video URL refresh before expiry (`expiresInSeconds`)
- Completion percent + quiz unlock badge in UI

### Endpoints integrated
- `GET /api/student/lessons/{lessonId}/video`
- `POST /api/student/lessons/{lessonId}/video/session`
- `POST /api/student/lessons/{lessonId}/video/progress`
- `GET /api/student/lessons/{lessonId}/video/progress`

## Exam / Quiz (Phase 7)

Implemented student quiz flow and admin/teacher minimal quiz builder:

### Admin / Teacher
- Question bank CRUD:
  - `POST /api/exam/questions`
  - `PUT /api/exam/questions/{id}`
  - `DELETE /api/exam/questions/{id}`
  - `GET /api/exam/questions?page=&size=&search=`
- Quiz CRUD:
  - `POST /api/exam/quizzes`
  - `PUT /api/exam/quizzes/{id}`
  - `DELETE /api/exam/quizzes/{id}`
  - `GET /api/exam/quizzes?courseId=&page=&size=`
- Quiz builder:
  - attach questions (`POST /api/exam/quizzes/{quizId}/questions`)
  - reorder questions (`POST /api/exam/quizzes/{quizId}/questions/reorder`)

### Student
- Quiz list (locked/unlocked)
- Start attempt + answer form + timer
- Submit attempt + result view
- Attempt history

Student endpoints integrated:
- `GET /api/student/courses/{courseId}/quizzes`
- `POST /api/student/quizzes/{quizId}/start`
- `POST /api/student/attempts/{attemptId}/submit`
- `GET /api/student/quizzes/{quizId}/attempts`

## Course Progress + Certificate (Phase 8)

Implemented progress/certificate features for Admin, Teacher, Student and public verify:

### Student
- `/student/courses/:courseId/progress`
- Shows attendance/video/test metrics, completion status, completion rules, certificate block
- Certificate actions: download PDF, verify URL, copy serial

### Teacher
- `/teacher/courses/:courseId/progress`
- Read-only per-student progress table (attendance/video/test/status/completedAt)

### Admin
- `/admin/courses/:courseId/completion`
  - get/update completion rules
- `/admin/courses/:courseId/progress`
  - recalculate progress
  - revoke certificate by serial

### Public
- `/verify/certificate/:serial`
  - public certificate verification statuses (VALID/REVOKED/NOT_FOUND/TAMPERED)

Endpoints integrated:
- `PUT /api/admin/courses/{courseId}/completion-rules`
- `GET /api/admin/courses/{courseId}/completion-rules`
- `POST /api/admin/courses/{courseId}/recalculate-progress`
- `POST /api/admin/certificates/{serial}/revoke`
- `GET /api/teacher/courses/{courseId}/progress`
- `GET /api/student/courses/{courseId}/progress`
- `GET /api/student/courses/{courseId}/certificate`
- `GET /api/public/certificates/verify/{serial}`
