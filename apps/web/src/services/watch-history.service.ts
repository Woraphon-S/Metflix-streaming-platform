import { api } from './api';
import type { WatchHistoryItem } from '@metflix/shared-types';

export interface ProgressPayload {
  contentType: 'movie' | 'episode';
  contentId: string;
  progressSeconds: number;
  durationSeconds: number;
}

export const watchHistoryService = {
  continueWatching: async (limit = 12): Promise<WatchHistoryItem[]> => {
    const { data } = await api.get<WatchHistoryItem[]>('/watch-history/continue', {
      params: { limit },
    });
    return data;
  },
  getProgress: async (contentType: 'movie' | 'episode', contentId: string) => {
    const { data } = await api.get<WatchHistoryItem | null>(
      `/watch-history/${contentType}/${contentId}`,
    );
    return data;
  },
  saveProgress: async (payload: ProgressPayload) => {
    const { data } = await api.post('/watch-history/progress', payload);
    return data;
  },
};
