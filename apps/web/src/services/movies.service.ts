import { api } from './api';
import type {
  ContentGenre,
  ContentHighlight,
  MovieDetail,
  MovieSummary,
  PaginatedResponse,
} from '@metflix/shared-types';

export interface MovieAdminInput {
  title: string;
  slug?: string;
  description?: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  videoUrl?: string;
  durationSeconds?: number;
  maturityRating?: string;
  status?: 'draft' | 'published' | 'archived';
  highlight?: ContentHighlight;
  genre?: ContentGenre;
}

export const moviesService = {
  list: async (params?: { page?: number; pageSize?: number; search?: string }) => {
    const { data } = await api.get<PaginatedResponse<MovieSummary>>('/movies', { params });
    return data;
  },
  detail: async (id: string): Promise<MovieDetail> => {
    const { data } = await api.get<MovieDetail>(`/movies/${id}`);
    return data;
  },
  adminList: async (params?: { page?: number; pageSize?: number; search?: string }) => {
    const { data } = await api.get<PaginatedResponse<MovieDetail>>('/admin/movies', { params });
    return data;
  },
  adminDetail: async (id: string): Promise<MovieDetail> => {
    const { data } = await api.get<MovieDetail>(`/admin/movies/${id}`);
    return data;
  },
  adminCreate: async (payload: MovieAdminInput): Promise<MovieDetail> => {
    const { data } = await api.post<MovieDetail>('/admin/movies', payload);
    return data;
  },
  adminUpdate: async (id: string, payload: MovieAdminInput): Promise<MovieDetail> => {
    const { data } = await api.patch<MovieDetail>(`/admin/movies/${id}`, payload);
    return data;
  },
  adminRemove: async (id: string): Promise<void> => {
    await api.delete(`/admin/movies/${id}`);
  },
};
