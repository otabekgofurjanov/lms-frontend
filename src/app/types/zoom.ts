export type ZoomMeetingStatus = 'SCHEDULED' | 'LIVE' | 'ENDED';

export interface ZoomMeetingCreateRequest {
  startTime: string;
  durationMinutes: number;
  topic?: string;
}

export interface ZoomMeetingResponse {
  id: number;
  lessonId: number;
  zoomMeetingId: string;
  joinUrl: string;
  startTime: string;
  durationMinutes: number;
  status: ZoomMeetingStatus;
}

export interface ZoomConnectUrlResponse {
  url: string;
}

export interface StudentJoinLinkResponse {
  joinUrl: string;
}
