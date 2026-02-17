interface AppEnv {
  apiBaseUrl: string;
  appName: string;
}

const requiredEnv = (key: keyof ImportMetaEnv): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const env: AppEnv = {
  apiBaseUrl: requiredEnv('VITE_API_BASE_URL'),
  appName: import.meta.env.VITE_APP_NAME || 'LMS',
};
