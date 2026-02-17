import type { Role } from '@/app/types/auth';

export type RoleCode = Role;
export type QuestionType = 'MCQ';

export interface QuestionAdmin {
  id: number;
  text: string;
  options: string[];
  explanation?: string;
  createdAt: string;
  correctIndex?: number;
}

export interface CreateQuestionRequest {
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface UpdateQuestionRequest extends CreateQuestionRequest {}

export interface QuizAdmin {
  id: number;
  courseId: number;
  lessonId?: number | null;
  title: string;
  timeLimitSec?: number | null;
  maxAttempts: number;
  passScorePct: number;
  isActive: boolean;
  questionIds?: number[];
}

export interface CreateQuizRequest {
  courseId: number;
  lessonId?: number | null;
  title: string;
  timeLimitSec?: number | null;
  maxAttempts: number;
  passScorePct: number;
  isActive: boolean;
}

export interface UpdateQuizRequest extends CreateQuizRequest {}

export interface AttachQuestionsRequest {
  questionIds: number[];
}

export interface ReorderQuestionsRequest {
  questionIdsInOrder: number[];
}

export interface StudentQuizListItem {
  quizId: number;
  title: string;
  lessonId?: number | null;
  passScorePct: number;
  maxAttempts: number;
  attemptsUsed: number;
  canStart: boolean;
}

export interface StudentQuizAttempt {
  attemptId: number;
  quizId: number;
  timeLimitSec?: number | null;
  questions: Array<{
    questionId: number;
    text: string;
    options: string[];
  }>;
}

export interface SubmitAttemptRequest {
  answers: Array<{
    questionId: number;
    selectedIndex: number | null;
  }>;
}

export interface StudentQuizResult {
  attemptId: number;
  quizId: number;
  totalQuestions: number;
  correctCount: number;
  scorePct: number;
  passed: boolean;
  finishedAt: string;
}

export interface AttemptHistoryItem {
  attemptNo: number;
  scorePct: number;
  passed: boolean;
  startedAt: string;
  finishedAt?: string;
  status: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
