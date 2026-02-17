export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  roles: Role[];
}

export type LoginResponse = TokenPair;
export type MeResponse = UserProfile;
