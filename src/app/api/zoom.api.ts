import type {
  StudentJoinLinkResponse,
  ZoomConnectUrlResponse,
  ZoomMeetingCreateRequest,
  ZoomMeetingResponse,
} from '@/app/types/zoom';

import { http } from './http';

export const zoomApi = {
  getConnectUrl() {
    return http.get<ZoomConnectUrlResponse>('/api/zoom/connect-url');
  },
  disconnectZoom() {
    return http.post<void>('/api/zoom/disconnect');
  },
  async getLessonZoomMeeting(lessonId: number): Promise<ZoomMeetingResponse | null> {
    try {
      return await http.get<ZoomMeetingResponse>(`/api/lessons/${lessonId}/zoom-meeting`);
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status === 404) {
        return null;
      }
      throw error;
    }
  },
  createLessonZoomMeeting(lessonId: number, payload: ZoomMeetingCreateRequest) {
    return http.post<ZoomMeetingResponse>(`/api/lessons/${lessonId}/zoom-meeting`, payload);
  },
  getStudentJoinLink(lessonId: number) {
    return http.get<StudentJoinLinkResponse>(`/api/student/lessons/${lessonId}/join-link`);
  },
};
