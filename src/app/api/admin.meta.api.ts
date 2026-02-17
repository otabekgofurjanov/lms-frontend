import type { RoleCode, RoleItem } from '@/app/types/users';

import { http } from './http';

const toRoleItem = (item: unknown): RoleItem => {
  if (typeof item === 'string') {
    return { code: item as RoleCode, name: item };
  }

  if (typeof item === 'object' && item !== null) {
    const role = item as { code?: string; name?: string };
    const code = (role.code ?? role.name ?? 'STUDENT') as RoleCode;
    return {
      code,
      name: role.name ?? code,
    };
  }

  return { code: 'STUDENT', name: 'STUDENT' };
};

export const adminMetaApi = {
  async getRoles(): Promise<RoleItem[]> {
    const data = await http.get<unknown[]>('/api/admin/roles');
    return data.map((role) => toRoleItem(role));
  },
  getPermissions() {
    return http.get<string[]>('/api/admin/permissions');
  },
};
