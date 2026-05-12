import axios, { AxiosError, AxiosInstance } from 'axios';

const STORAGE_KEY = 'metflix.token';

let memoryToken: string | null = null;

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return memoryToken;
  return window.localStorage.getItem(STORAGE_KEY);
};

export const setStoredToken = (token: string | null): void => {
  if (typeof window === 'undefined') {
    memoryToken = token;
    return;
  }
  if (token) window.localStorage.setItem(STORAGE_KEY, token);
  else window.localStorage.removeItem(STORAGE_KEY);
};

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api';

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response?.status === 401) {
      setStoredToken(null);
    }
    return Promise.reject(error);
  },
);

export const extractErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};
