import { api } from './api';
import type { AdminDashboardStats, PaginatedResponse } from '@metflix/shared-types';

export interface AdminUserItem {
  id: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export const adminService = {
  dashboard: async (): Promise<AdminDashboardStats> => {
    const { data } = await api.get<AdminDashboardStats>('/admin/dashboard');
    return data;
  },
  users: async (params?: { page?: number; pageSize?: number; search?: string }) => {
    const { data } = await api.get<PaginatedResponse<AdminUserItem>>('/admin/users', { params });
    return data;
  },
};
