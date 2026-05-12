'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Activity, Film, Sparkles, Tv, Users } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/lib/format';

export default function AdminDashboardPage() {
  const dashboardQ = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminService.dashboard(),
  });

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 text-emerald">
          <Sparkles className="h-5 w-5" /> Admin overview
        </div>
        <h1 className="font-display text-3xl font-extrabold">Dashboard</h1>
        <p className="text-text-muted">
          Snapshot of platform metrics and recent activity.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Users"
          value={dashboardQ.data?.totalUsers}
          loading={dashboardQ.isLoading}
        />
        <StatCard
          icon={<Film className="h-4 w-4" />}
          label="Movies"
          value={dashboardQ.data?.totalMovies}
          loading={dashboardQ.isLoading}
        />
        <StatCard
          icon={<Tv className="h-4 w-4" />}
          label="Series"
          value={dashboardQ.data?.totalSeries}
          loading={dashboardQ.isLoading}
        />
        <StatCard
          icon={<Tv className="h-4 w-4" />}
          label="Episodes"
          value={dashboardQ.data?.totalEpisodes}
          loading={dashboardQ.isLoading}
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="Notifications"
          value={dashboardQ.data?.totalNotifications}
          loading={dashboardQ.isLoading}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-surface/40 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent movies</h2>
            <Link
              href="/admin/movies"
              className="text-xs uppercase tracking-wide text-emerald hover:brightness-110"
            >
              Manage
            </Link>
          </div>
          {dashboardQ.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : dashboardQ.data?.recentMovies.length ? (
            <ul className="space-y-2">
              {dashboardQ.data.recentMovies.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-xl bg-surface/60 px-3 py-2 text-sm"
                >
                  <span className="line-clamp-1 font-medium">{m.title}</span>
                  <Badge
                    tone={
                      m.status === 'published'
                        ? 'emerald'
                        : m.status === 'archived'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {m.status}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">No movies yet.</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/5 bg-surface/40 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent series</h2>
            <Link
              href="/admin/series"
              className="text-xs uppercase tracking-wide text-emerald hover:brightness-110"
            >
              Manage
            </Link>
          </div>
          {dashboardQ.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : dashboardQ.data?.recentSeries.length ? (
            <ul className="space-y-2">
              {dashboardQ.data.recentSeries.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-xl bg-surface/60 px-3 py-2 text-sm"
                >
                  <span className="line-clamp-1 font-medium">{s.title}</span>
                  <span className="text-xs text-text-muted">
                    {s.seasonsCount} seasons · {s.episodesCount} episodes
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">No series yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/5 bg-surface/40 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent activity</h2>
        </div>
        {dashboardQ.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : dashboardQ.data?.recentLogs.length ? (
          <ul className="space-y-2 text-sm">
            {dashboardQ.data.recentLogs.map((log) => (
              <li
                key={log.id}
                className="flex flex-wrap items-center gap-2 rounded-xl bg-surface/60 px-3 py-2"
              >
                <Badge tone="primary">{log.action}</Badge>
                <span className="text-text-muted">{log.entityType}</span>
                <span className="text-text-subtle">·</span>
                <span className="text-text-subtle">{log.adminEmail ?? 'system'}</span>
                <span className="ml-auto text-xs text-text-subtle">
                  {formatRelativeTime(log.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-muted">No activity yet.</p>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface/40 p-5">
      <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-text-muted">
        {icon} {label}
      </div>
      <div className="mt-2 font-display text-3xl font-bold">
        {loading ? <Skeleton className="h-8 w-16" /> : value ?? 0}
      </div>
    </div>
  );
}
