'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Spinner } from '@/components/ui/Spinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'user';
}

export function AuthGuard({ children, requireRole }: AuthGuardProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (requireRole === 'admin' && user.role !== 'admin') {
      router.replace('/browse');
    }
  }, [user, hydrated, requireRole, router]);

  if (!hydrated || !user || (requireRole === 'admin' && user.role !== 'admin')) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
