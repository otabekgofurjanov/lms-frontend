import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import router from '@/app/router';
import { authApi } from '@/app/api/auth.api';
import type { Role, UserProfile } from '@/app/types/auth';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '@/app/store/token.service';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(getAccessToken());
  const user = ref<UserProfile | null>(null);
  const initialized = ref(false);

  const isAuthenticated = computed(() => Boolean(accessToken.value && user.value));

  const hasRole = (role: Role): boolean => {
    return user.value?.roles.includes(role) ?? false;
  };

  const fetchMe = async (): Promise<void> => {
    const profile = await authApi.me();
    user.value = profile;
  };

  const refresh = async (): Promise<boolean> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    const tokenPair = await authApi.refresh({ refreshToken });
    setAccessToken(tokenPair.accessToken);
    setRefreshToken(tokenPair.refreshToken);
    accessToken.value = tokenPair.accessToken;
    return true;
  };

  const login = async (email: string, password: string): Promise<void> => {
    const tokenPair = await authApi.login({ email, password });
    setAccessToken(tokenPair.accessToken);
    setRefreshToken(tokenPair.refreshToken);
    accessToken.value = tokenPair.accessToken;
    await fetchMe();
  };

  const logout = async (): Promise<void> => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout({ refreshToken });
      } catch {
        // ignore logout API failure
      }
    }

    clearTokens();
    accessToken.value = null;
    user.value = null;
    if (router.currentRoute.value.path !== '/login') {
      await router.push('/login');
    }
  };

  const initialize = async (): Promise<void> => {
    if (initialized.value) {
      return;
    }

    initialized.value = true;
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return;
    }

    try {
      const refreshed = await refresh();
      if (refreshed) {
        await fetchMe();
      }
    } catch {
      await logout();
    }
  };

  return {
    accessToken,
    user,
    initialized,
    isAuthenticated,
    hasRole,
    login,
    refresh,
    fetchMe,
    logout,
    initialize,
  };
});
