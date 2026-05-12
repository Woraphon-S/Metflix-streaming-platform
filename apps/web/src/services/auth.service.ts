import { api } from './api';
import type { AuthResponse, AuthUser } from '@metflix/shared-types';

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AdminLoginPayload {
  id: string;
  password: string;
}

export const authService = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    return data;
  },
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  },
  adminLogin: async (payload: AdminLoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/admin-login', payload);
    return data;
  },
  me: async (): Promise<AuthUser> => {
    const { data } = await api.get<AuthUser>('/auth/me');
    return data;
  },
};
