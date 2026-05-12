'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Film,
  LayoutDashboard,
  ListVideo,
  Tv,
  Users,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { cn } from '@/lib/cn';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/movies', label: 'Movies', icon: Film },
  { href: '/admin/series', label: 'Series', icon: Tv },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthGuard requireRole="admin">
      <AppShell>
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <aside className="sticky top-24 hidden h-fit w-56 flex-shrink-0 md:block">
            <div className="rounded-2xl border border-emerald/20 bg-surface/40 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wide text-emerald">
                <ListVideo className="h-4 w-4" />
                Admin console
              </div>
              <nav className="space-y-1">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const active = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                        active
                          ? 'bg-emerald/10 text-emerald shadow-glowEmerald'
                          : 'text-text-muted hover:bg-white/5 hover:text-text',
                      )}
                    >
                      <Icon className="h-4 w-4" /> {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center gap-2 md:hidden">
              {NAV.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs',
                      active
                        ? 'bg-emerald text-background'
                        : 'bg-surface/70 text-text-muted',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            {children}
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
