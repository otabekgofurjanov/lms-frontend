import type {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  MeResponse,
  RefreshRequest,
  TokenPair,
} from '@/app/types/auth';

import { http } from './http';

export const authApi = {
  login(payload: LoginRequest) {
    return http.post<LoginResponse>('/api/auth/login', payload);
  },
  refresh(payload: RefreshRequest) {
    return http.post<TokenPair>('/api/auth/refresh', payload);
  },
  logout(payload: LogoutRequest) {
    return http.post<void>('/api/auth/logout', payload);
  },
  me() {
    return http.get<MeResponse>('/api/auth/me');
  },
};
