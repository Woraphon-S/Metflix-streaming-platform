'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ImageIcon, UserCircle2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { api, extractErrorMessage } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';

const profileSchema = z.object({
  displayName: z.string().min(2, 'At least 2 characters').max(40),
  avatarUrl: z
    .string()
    .url('Must be a valid URL (https://...)')
    .or(z.literal('')),
});
type FormValues = z.infer<typeof profileSchema>;

interface ProfileResponse {
  id: string;
  email: string;
  role: 'user' | 'admin';
  displayName: string;
  avatarUrl: string | null;
  memberSince: string;
  stats: { watched: number; completed: number; myList: number };
}

export default function ProfilePage() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const profileQ = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const { data } = await api.get<ProfileResponse>('/users/me');
      return data;
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: '', avatarUrl: '' },
  });

  useEffect(() => {
    if (profileQ.data) {
      form.reset({
        displayName: profileQ.data.displayName,
        avatarUrl: profileQ.data.avatarUrl ?? '',
      });
    }
  }, [profileQ.data, form]);

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data } = await api.patch<ProfileResponse>('/users/me', {
        displayName: values.displayName,
        avatarUrl: values.avatarUrl || undefined,
      });
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      setUser({
        id: data.id,
        email: data.email,
        role: data.role,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (error) => {
      setServerError(extractErrorMessage(error));
    },
  });

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    updateMutation.mutate(values);
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
          <header className="flex flex-wrap items-end gap-6">
            <div className="relative">
              {profileQ.data?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileQ.data.avatarUrl}
                  alt={profileQ.data.displayName}
                  className="h-24 w-24 rounded-2xl object-cover ring-2 ring-primary/40 shadow-card"
                />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br from-primary to-emerald text-3xl font-display font-bold text-background ring-2 ring-white/20">
                  {(profileQ.data?.displayName ?? '?').slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-text-muted">
                Account
              </div>
              <h1 className="font-display text-3xl font-extrabold">
                {profileQ.data?.displayName ?? '—'}
              </h1>
              <p className="text-text-muted">{profileQ.data?.email}</p>
              {profileQ.data && (
                <Badge tone={profileQ.data.role === 'admin' ? 'emerald' : 'primary'}>
                  {profileQ.data.role}
                </Badge>
              )}
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Titles watched" value={profileQ.data?.stats.watched ?? 0} />
            <StatCard label="Completed" value={profileQ.data?.stats.completed ?? 0} />
            <StatCard label="Saved to My List" value={profileQ.data?.stats.myList ?? 0} />
          </section>

          <section className="glass-strong rounded-2xl p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold">Edit profile</h2>
            <p className="mt-1 text-sm text-text-muted">
              Update your display name and avatar. Email is fixed.
            </p>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid gap-4 sm:grid-cols-2">
              <Input
                label="Display name"
                leading={<UserCircle2 className="h-4 w-4" />}
                error={form.formState.errors.displayName?.message}
                {...form.register('displayName')}
              />
              <Input
                label="Avatar URL"
                leading={<ImageIcon className="h-4 w-4" />}
                placeholder="https://..."
                error={form.formState.errors.avatarUrl?.message}
                {...form.register('avatarUrl')}
              />
              <div className="sm:col-span-2 flex items-center gap-3">
                <Button
                  type="submit"
                  loading={updateMutation.isPending}
                  trailing={saved ? <CheckCircle2 className="h-4 w-4 text-emerald" /> : null}
                >
                  Save changes
                </Button>
                {saved && (
                  <span className="text-sm text-emerald">Profile updated</span>
                )}
                {serverError && (
                  <span className="text-sm text-danger">{serverError}</span>
                )}
              </div>
            </form>
          </section>
        </div>
      </AppShell>
    </AuthGuard>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface/40 p-5">
      <div className="text-xs uppercase tracking-wide text-text-muted">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}
