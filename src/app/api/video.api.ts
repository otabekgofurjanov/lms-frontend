import type {
  LessonVideoResponse,
  VideoProgressEventRequest,
  VideoProgressResponse,
  VideoProgressSnapshot,
  VideoSessionResponse,
} from '@/app/types/video';

import { http } from './http';

export const videoApi = {
  getLessonVideo(lessonId: number) {
    return http.get<LessonVideoResponse>(`/api/student/lessons/${lessonId}/video`);
  },
  createVideoSession(lessonId: number) {
    return http.post<VideoSessionResponse>(`/api/student/lessons/${lessonId}/video/session`);
  },
  sendVideoProgress(lessonId: number, payload: VideoProgressEventRequest) {
    return http.post<VideoProgressResponse>(`/api/student/lessons/${lessonId}/video/progress`, payload);
  },
  getVideoProgress(lessonId: number) {
    return http.get<VideoProgressSnapshot>(`/api/student/lessons/${lessonId}/video/progress`);
  },
};
