'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser, Profile } from '@metflix/shared-types';
import { setStoredToken, setStoredProfileId } from '@/services/api';

interface AuthState {
  user: AuthUser | null;
  activeProfile: Profile | null;
  hydrated: boolean;
  setSession: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser | null) => void;
  setActiveProfile: (profile: Profile | null) => void;
  clear: () => void;
  markHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      activeProfile: null,
      hydrated: false,
      setSession: (token, user) => {
        setStoredToken(token);
        set({ user });
      },
      setUser: (user) => set({ user }),
      setActiveProfile: (profile) => {
        setStoredProfileId(profile?.id ?? null);
        set({ activeProfile: profile });
      },
      clear: () => {
        setStoredToken(null);
        setStoredProfileId(null);
        set({ user: null, activeProfile: null });
      },
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'metflix.auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        activeProfile: state.activeProfile,
      }),
      onRehydrateStorage: () => (state) => {
        // Keep the axios profile header in sync with the rehydrated profile.
        if (state?.activeProfile) setStoredProfileId(state.activeProfile.id);
        state?.markHydrated();
      },
    },
  ),
);
