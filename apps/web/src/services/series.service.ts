import { api } from './api';
import type {
  EpisodeDetail,
  PaginatedResponse,
  SeriesDetail,
  SeriesSummary,
} from '@metflix/shared-types';

export interface SeriesAdminInput {
  title: string;
  slug?: string;
  description?: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface SeasonAdminInput {
  seriesId: string;
  seasonNumber: number;
  title: string;
  description?: string;
}

export interface EpisodeAdminInput {
  seasonId: string;
  episodeNumber: number;
  title: string;
  description?: string;
  posterUrl?: string;
  videoUrl?: string;
  durationSeconds?: number;
  status?: 'draft' | 'published' | 'archived';
}

export const seriesService = {
  list: async (params?: { page?: number; pageSize?: number; search?: string }) => {
    const { data } = await api.get<PaginatedResponse<SeriesSummary>>('/series', { params });
    return data;
  },
  detail: async (id: string): Promise<SeriesDetail> => {
    const { data } = await api.get<SeriesDetail>(`/series/${id}`);
    return data;
  },
  episodeDetail: async (id: string): Promise<EpisodeDetail> => {
    const { data } = await api.get<EpisodeDetail>(`/episodes/${id}`);
    return data;
  },
  nextEpisode: async (id: string): Promise<EpisodeDetail | null> => {
    const { data } = await api.get<EpisodeDetail | null>(`/episodes/${id}/next`);
    return data;
  },
  adminList: async (params?: { page?: number; pageSize?: number; search?: string }) => {
    const { data } = await api.get<PaginatedResponse<SeriesSummary>>('/admin/series', { params });
    return data;
  },
  adminDetail: async (id: string): Promise<SeriesDetail> => {
    const { data } = await api.get<SeriesDetail>(`/admin/series/${id}`);
    return data;
  },
  adminCreate: async (payload: SeriesAdminInput) => {
    const { data } = await api.post<SeriesDetail>('/admin/series', payload);
    return data;
  },
  adminUpdate: async (id: string, payload: SeriesAdminInput) => {
    const { data } = await api.patch<SeriesDetail>(`/admin/series/${id}`, payload);
    return data;
  },
  adminRemove: async (id: string) => {
    await api.delete(`/admin/series/${id}`);
  },
  adminCreateSeason: async (payload: SeasonAdminInput) => {
    const { data } = await api.post('/admin/seasons', payload);
    return data;
  },
  adminCreateEpisode: async (payload: EpisodeAdminInput) => {
    const { data } = await api.post('/admin/episodes', payload);
    return data;
  },
};
