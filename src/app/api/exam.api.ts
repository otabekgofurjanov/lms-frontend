import type {
  AttachQuestionsRequest,
  AttemptHistoryItem,
  CreateQuestionRequest,
  CreateQuizRequest,
  PagedResult,
  QuestionAdmin,
  QuizAdmin,
  ReorderQuestionsRequest,
  StudentQuizAttempt,
  StudentQuizListItem,
  StudentQuizResult,
  SubmitAttemptRequest,
  UpdateQuestionRequest,
  UpdateQuizRequest,
} from '@/app/types/exam';

import { http } from './http';

interface PageableResponse<T> {
  content?: T[];
  totalElements?: number;
  number?: number;
  size?: number;
  items?: T[];
  total?: number;
  page?: number;
}

const normalize = <T>(payload: PageableResponse<T> | T[], page: number, size: number): PagedResult<T> => {
  if (Array.isArray(payload)) {
    return { items: payload, total: payload.length, page, size };
  }

  return {
    items: payload.content ?? payload.items ?? [],
    total: payload.totalElements ?? payload.total ?? 0,
    page: payload.number ?? payload.page ?? page,
    size: payload.size ?? size,
  };
};

export const examApi = {
  async listQuestions(params: { page: number; size: number; search?: string }): Promise<PagedResult<QuestionAdmin>> {
    const payload = await http.get<PageableResponse<QuestionAdmin> | QuestionAdmin[]>('/api/exam/questions', { params });
    return normalize(payload, params.page, params.size);
  },
  createQuestion(payload: CreateQuestionRequest) {
    return http.post<QuestionAdmin>('/api/exam/questions', payload);
  },
  updateQuestion(id: number, payload: UpdateQuestionRequest) {
    return http.put<QuestionAdmin>(`/api/exam/questions/${id}`, payload);
  },
  deleteQuestion(id: number) {
    return http.delete<void>(`/api/exam/questions/${id}`);
  },

  async listQuizzes(params: { courseId: number; page: number; size: number }): Promise<PagedResult<QuizAdmin>> {
    const payload = await http.get<PageableResponse<QuizAdmin> | QuizAdmin[]>('/api/exam/quizzes', { params });
    return normalize(payload, params.page, params.size);
  },
  createQuiz(payload: CreateQuizRequest) {
    return http.post<QuizAdmin>('/api/exam/quizzes', payload);
  },
  updateQuiz(id: number, payload: UpdateQuizRequest) {
    return http.put<QuizAdmin>(`/api/exam/quizzes/${id}`, payload);
  },
  deleteQuiz(id: number) {
    return http.delete<void>(`/api/exam/quizzes/${id}`);
  },
  attachQuestions(quizId: number, questionIds: AttachQuestionsRequest['questionIds']) {
    return http.post<void>(`/api/exam/quizzes/${quizId}/questions`, { questionIds });
  },
  reorderQuizQuestions(quizId: number, questionIdsInOrder: ReorderQuestionsRequest['questionIdsInOrder']) {
    return http.post<void>(`/api/exam/quizzes/${quizId}/questions/reorder`, { questionIdsInOrder });
  },

  listStudentQuizzes(courseId: number) {
    return http.get<StudentQuizListItem[]>(`/api/student/courses/${courseId}/quizzes`);
  },
  startQuiz(quizId: number) {
    return http.post<StudentQuizAttempt>(`/api/student/quizzes/${quizId}/start`);
  },
  submitAttempt(attemptId: number, payload: SubmitAttemptRequest) {
    return http.post<StudentQuizResult>(`/api/student/attempts/${attemptId}/submit`, payload);
  },
  listAttemptHistory(quizId: number) {
    return http.get<AttemptHistoryItem[]>(`/api/student/quizzes/${quizId}/attempts`);
  },
};
