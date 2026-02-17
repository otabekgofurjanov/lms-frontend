import type { Role } from '@/app/types/auth';

export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'DELETED';
export type RoleCode = Role;

export interface UserListItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  status: UserStatus;
  roles: RoleCode[];
  createdAt: string;
}

export interface UserDetailResponse extends UserListItem {}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  roles: RoleCode[];
}

export interface UpdateUserRequest {
  fullName: string;
  phone?: string;
  roles: RoleCode[];
}

export interface UpdateStatusRequest {
  status: Extract<UserStatus, 'ACTIVE' | 'BLOCKED'>;
}

export interface ImportResult {
  total: number;
  created: number;
  updated: number;
  failed: number;
  errors: string[];
}

export interface UsersListQuery {
  page: number;
  size: number;
  search?: string;
}

export interface UsersListResult {
  items: UserListItem[];
  total: number;
  page: number;
  size: number;
}

export interface RoleItem {
  code: RoleCode;
  name: string;
}
