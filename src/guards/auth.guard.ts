import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

import { useAuthStore } from '@/app/store/auth.store';
import type { Role } from '@/app/types/auth';

export const authGuard = async (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
): Promise<void> => {
  const authStore = useAuthStore();
  await authStore.initialize();

  const requiresAuth = Boolean(to.meta.requiresAuth);
  const requiredRoles = (to.meta.roles as Role[] | undefined) ?? [];

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
    return;
  }

  if (requiredRoles.length > 0 && !requiredRoles.some((role) => authStore.hasRole(role))) {
    next('/forbidden');
    return;
  }

  if (to.path === '/login' && authStore.isAuthenticated) {
    const primaryRole = authStore.user?.roles[0];
    if (primaryRole === 'ADMIN') next('/admin/dashboard');
    else if (primaryRole === 'TEACHER') next('/teacher/dashboard');
    else if (primaryRole === 'STUDENT') next('/student/dashboard');
    else next('/forbidden');
    return;
  }

  next();
};
