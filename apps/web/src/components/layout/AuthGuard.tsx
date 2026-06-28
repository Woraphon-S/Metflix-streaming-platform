'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Spinner } from '@/components/ui/Spinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'user';
  requireProfile?: boolean;
}

export function AuthGuard({
  children,
  requireRole,
  requireProfile = true,
}: AuthGuardProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const activeProfile = useAuthStore((s) => s.activeProfile);
  const hydrated = useAuthStore((s) => s.hydrated);

  const needsProfile = requireProfile && requireRole !== 'admin';

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (requireRole === 'admin' && user.role !== 'admin') {
      router.replace('/browse');
      return;
    }
    if (needsProfile && !activeProfile) {
      router.replace('/profiles');
    }
  }, [user, activeProfile, hydrated, requireRole, needsProfile, router]);

  const blocked =
    !hydrated ||
    !user ||
    (requireRole === 'admin' && user.role !== 'admin') ||
    (needsProfile && !activeProfile);

  if (blocked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
