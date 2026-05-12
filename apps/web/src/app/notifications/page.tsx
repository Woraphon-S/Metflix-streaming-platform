'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Megaphone, ShieldAlert, Sparkles } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { notificationsService } from '@/services/notifications.service';
import { formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { NotificationType } from '@metflix/shared-types';

const ICONS: Record<NotificationType, React.ReactNode> = {
  movie_published: <Sparkles className="h-4 w-4" />,
  series_published: <Sparkles className="h-4 w-4" />,
  episode_published: <Sparkles className="h-4 w-4" />,
  system: <Megaphone className="h-4 w-4" />,
  admin_message: <Megaphone className="h-4 w-4" />,
  security: <ShieldAlert className="h-4 w-4" />,
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const listQ = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsService.list(50),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAll = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
          <header className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-primary-400">
                <Bell className="h-5 w-5" />
                <span className="text-xs uppercase tracking-wide">Notifications</span>
              </div>
              <h1 className="font-display text-3xl font-extrabold">All notifications</h1>
              <p className="text-text-muted">
                New releases, admin announcements, and system updates.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leading={<CheckCheck className="h-4 w-4" />}
              onClick={() => markAll.mutate()}
              loading={markAll.isPending}
              disabled={!listQ.data?.some((n) => !n.isRead)}
            >
              Mark all read
            </Button>
          </header>

          {listQ.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : listQ.data && listQ.data.length > 0 ? (
            <ul className="space-y-3">
              {listQ.data.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    'glass flex items-start gap-3 rounded-2xl border border-white/5 p-4 transition-colors',
                    !n.isRead && 'ring-1 ring-primary/40 bg-primary/5',
                  )}
                >
                  <div
                    className={cn(
                      'grid h-10 w-10 flex-shrink-0 place-items-center rounded-full border',
                      n.type === 'security'
                        ? 'border-danger/40 text-danger bg-danger/10'
                        : 'border-primary/40 text-primary-400 bg-primary/10',
                    )}
                  >
                    {ICONS[n.type]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-sm font-semibold">{n.title}</h3>
                      <Badge tone={n.type === 'security' ? 'danger' : 'primary'}>
                        {n.type.replace('_', ' ')}
                      </Badge>
                      {!n.isRead && (
                        <span className="ml-auto inline-flex h-2 w-2 rounded-full bg-emerald shadow-glowEmerald" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-text-muted">{n.message}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-text-subtle">
                      <span>{formatRelativeTime(n.createdAt)}</span>
                      {!n.isRead && (
                        <button
                          onClick={() => markRead.mutate(n.id)}
                          className="text-emerald hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Bell className="h-8 w-8" />}
              title="No notifications yet"
              description="When new content drops or admins send announcements, you'll see them here."
            />
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
