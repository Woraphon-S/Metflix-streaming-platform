import { api } from './api';
import type { Profile } from '@metflix/shared-types';

export interface ProfileInput {
  displayName: string;
  avatarKey?: string;
}

export const profilesService = {
  list: async (): Promise<Profile[]> => {
    const { data } = await api.get<Profile[]>('/profiles');
    return data;
  },
  create: async (payload: ProfileInput): Promise<Profile> => {
    const { data } = await api.post<Profile>('/profiles', payload);
    return data;
  },
  update: async (id: string, payload: Partial<ProfileInput>): Promise<Profile> => {
    const { data } = await api.patch<Profile>(`/profiles/${id}`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/profiles/${id}`);
  },
};
