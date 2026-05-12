import { api } from './api';
import type { WatchlistItem } from '@metflix/shared-types';

export const watchlistService = {
  list: async (): Promise<WatchlistItem[]> => {
    const { data } = await api.get<WatchlistItem[]>('/watchlist');
    return data;
  },
  status: async (contentType: 'movie' | 'series', contentId: string) => {
    const { data } = await api.get<{ inWatchlist: boolean }>(
      `/watchlist/${contentType}/${contentId}/status`,
    );
    return data;
  },
  add: async (contentType: 'movie' | 'series', contentId: string) => {
    await api.post(`/watchlist/${contentType}/${contentId}`);
  },
  remove: async (contentType: 'movie' | 'series', contentId: string) => {
    await api.delete(`/watchlist/${contentType}/${contentId}`);
  },
};
