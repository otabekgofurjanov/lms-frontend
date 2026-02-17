import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { env } from '@/app/config/env';
import type { ApiResponse } from '@/app/types/api';
import type { TokenPair } from '@/app/types/auth';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '@/app/store/token.service';
import router from '@/app/router';
import { notifyError } from '@/utils/notify';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null): void => {
  pendingQueue.forEach((callback) => callback(token));
  pendingQueue = [];
};

const applyAuthHeader = (config: InternalAxiosRequestConfig, token: string): void => {
  config.headers.Authorization = `Bearer ${token}`;
};

const performLogout = async (): Promise<void> => {
  clearTokens();
  const { useAuthStore } = await import('@/app/store/auth.store');
  const authStore = useAuthStore();
  authStore.$patch({ accessToken: null, user: null });

  if (router.currentRoute.value.path !== '/login') {
    await router.push('/login');
  }
};

const refreshClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
});

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await refreshClient.post<ApiResponse<TokenPair>>('/api/auth/refresh', {
      refreshToken,
    });

    const tokenData = response.data.data;
    setAccessToken(tokenData.accessToken);
    setRefreshToken(tokenData.refreshToken);
    return tokenData.accessToken;
  } catch {
    return null;
  }
};

const createHttpClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: 15000,
  });

  client.interceptors.request.use((config) => {
    config.headers['X-Request-Id'] = crypto.randomUUID();
    const token = getAccessToken();
    if (token) {
      applyAuthHeader(config, token);
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      const payload = response.data as ApiResponse<unknown>;
      if (!payload.success) {
        const message = payload.error?.message ?? 'Request failed';
        notifyError(message);
        return Promise.reject(new Error(message));
      }
      return payload.data;
    },
    async (error: AxiosError<ApiResponse<unknown>>) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;
      const status = error.response?.status;

      if (status === 401 && originalRequest && !originalRequest._retry) {
        if (originalRequest.url?.includes('/api/auth/refresh')) {
          await performLogout();
          notifyError('Session expired. Please login again.');
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            pendingQueue.push((token) => {
              if (!token || !originalRequest) {
                reject(error);
                return;
              }

              applyAuthHeader(originalRequest, token);
              resolve(client(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const newToken = await refreshAccessToken();
        isRefreshing = false;
        processQueue(newToken);

        if (newToken) {
          applyAuthHeader(originalRequest, newToken);
          return client(originalRequest);
        }

        await performLogout();
        notifyError('Authentication failed. Please login again.');
      }

      if (status === 403) {
        await router.push('/forbidden');
      }

      const message =
        error.response?.data?.error?.message ?? error.message ?? 'Unexpected server error occurred.';
      notifyError(message);
      return Promise.reject(error);
    },
  );

  return client;
};

export const http = createHttpClient();
