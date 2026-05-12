'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { getStoredToken } from '@/services/api';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    authService
      .me()
      .then((user) => setUser(user))
      .catch(() => setUser(null));
  }, [setUser]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
