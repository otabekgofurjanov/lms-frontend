import type {
  CreateUserRequest,
  ImportResult,
  UpdateStatusRequest,
  UpdateUserRequest,
  UserDetailResponse,
  UserListItem,
  UsersListQuery,
  UsersListResult,
} from '@/app/types/users';

import { http } from './http';

interface PageableResponse {
  content?: UserListItem[];
  totalElements?: number;
  number?: number;
  size?: number;
  items?: UserListItem[];
  total?: number;
  page?: number;
}

const normalizeListResponse = (payload: PageableResponse | UserListItem[], query: UsersListQuery): UsersListResult => {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      total: payload.length,
      page: query.page,
      size: query.size,
    };
  }

  const items = payload.content ?? payload.items ?? [];
  const total = payload.totalElements ?? payload.total ?? items.length;
  const page = payload.number ?? payload.page ?? query.page;

  return {
    items,
    total,
    page,
    size: payload.size ?? query.size,
  };
};

export const adminUsersApi = {
  async listUsers(params: UsersListQuery): Promise<UsersListResult> {
    const payload = await http.get<PageableResponse | UserListItem[]>('/api/admin/users', { params });
    return normalizeListResponse(payload, params);
  },
  getUser(id: string) {
    return http.get<UserDetailResponse>(`/api/admin/users/${id}`);
  },
  createUser(payload: CreateUserRequest) {
    return http.post<UserDetailResponse>('/api/admin/users', payload);
  },
  updateUser(id: string, payload: UpdateUserRequest) {
    return http.put<UserDetailResponse>(`/api/admin/users/${id}`, payload);
  },
  updateUserStatus(id: string, status: UpdateStatusRequest['status']) {
    return http.patch<UserDetailResponse>(`/api/admin/users/${id}/status`, { status });
  },
  importUsersCsv(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return http.post<ImportResult>('/api/admin/users/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
