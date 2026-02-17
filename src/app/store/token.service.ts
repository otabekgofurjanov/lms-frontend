const REFRESH_TOKEN_KEY = 'lms_refresh_token';

let accessToken: string | null = null;

export const getAccessToken = (): string | null => accessToken;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setRefreshToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
    return;
  }
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const clearTokens = (): void => {
  setAccessToken(null);
  setRefreshToken(null);
};
