import axios, { AxiosError, AxiosInstance } from 'axios';

const STORAGE_KEY = 'metflix.token';
const PROFILE_KEY = 'metflix.profile';

let memoryToken: string | null = null;
let memoryProfileId: string | null = null;

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

export const getStoredProfileId = (): string | null => {
  if (typeof window === 'undefined') return memoryProfileId;
  return window.localStorage.getItem(PROFILE_KEY);
};

export const setStoredProfileId = (profileId: string | null): void => {
  if (typeof window === 'undefined') {
    memoryProfileId = profileId;
    return;
  }
  if (profileId) window.localStorage.setItem(PROFILE_KEY, profileId);
  else window.localStorage.removeItem(PROFILE_KEY);
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
  const profileId = getStoredProfileId();
  if (profileId) {
    config.headers = config.headers ?? {};
    config.headers['X-Profile-Id'] = profileId;
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
