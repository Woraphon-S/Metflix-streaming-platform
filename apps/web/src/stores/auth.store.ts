'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser } from '@metflix/shared-types';
import { setStoredToken } from '@/services/api';

interface AuthState {
  user: AuthUser | null;
  hydrated: boolean;
  setSession: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
  markHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      setSession: (token, user) => {
        setStoredToken(token);
        set({ user });
      },
      setUser: (user) => set({ user }),
      clear: () => {
        setStoredToken(null);
        set({ user: null });
      },
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'metflix.auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
