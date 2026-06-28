'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { Logo } from '@/components/brand/Logo';
import { Spinner } from '@/components/ui/Spinner';
import { profilesService } from '@/services/profiles.service';
import { useAuthStore } from '@/stores/auth.store';
import type { Profile } from '@metflix/shared-types';

const MAX_PROFILES = 5;

function WhoIsWatching() {
  const router = useRouter();
  const qc = useQueryClient();
  const setActiveProfile = useAuthStore((s) => s.setActiveProfile);

  const profilesQ = useQuery({
    queryKey: ['profiles'],
    queryFn: profilesService.list,
  });

  const choose = (profile: Profile) => {
    setActiveProfile(profile);
    // Per-profile data (My List, Continue watching) must refetch for the new identity.
    qc.invalidateQueries();
    router.push('/browse');
  };

  const profiles = profilesQ.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16">
        <div className="mb-10">
          <Logo />
        </div>
        <h1 className="mb-12 text-center font-display text-3xl font-bold sm:text-4xl">
          ใครกำลังดูอยู่?
        </h1>

        {profilesQ.isLoading ? (
          <Spinner />
        ) : (
          <div className="flex flex-wrap items-start justify-center gap-6 sm:gap-8">
            {profiles.map((profile) => (
              <motion.button
                key={profile.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => choose(profile)}
                className="group flex w-24 flex-col items-center gap-3 sm:w-28"
              >
                <ProfileAvatar
                  displayName={profile.displayName}
                  avatarKey={profile.avatarKey}
                  size="lg"
                  className="ring-2 ring-transparent transition group-hover:ring-white/80"
                />
                <span className="line-clamp-1 text-sm text-text-muted transition group-hover:text-text">
                  {profile.displayName}
                </span>
              </motion.button>
            ))}

            {profiles.length < MAX_PROFILES && (
              <Link
                href="/profiles/manage"
                className="group flex w-24 flex-col items-center gap-3 sm:w-28"
              >
                <span className="grid h-24 w-24 place-items-center rounded-2xl border-2 border-white/15 text-text-muted transition group-hover:border-white/60 group-hover:text-text sm:h-28 sm:w-28">
                  <Plus className="h-9 w-9" />
                </span>
                <span className="text-sm text-text-muted transition group-hover:text-text">
                  เพิ่มโปรไฟล์
                </span>
              </Link>
            )}
          </div>
        )}

        <Link
          href="/profiles/manage"
          className="mt-14 rounded-lg border border-white/20 px-6 py-2.5 text-sm uppercase tracking-wide text-text-muted transition hover:border-white/60 hover:text-text"
        >
          จัดการโปรไฟล์
        </Link>
      </div>
    </div>
  );
}

export default function ProfilesPage() {
  return (
    <AuthGuard requireProfile={false}>
      <WhoIsWatching />
    </AuthGuard>
  );
}
