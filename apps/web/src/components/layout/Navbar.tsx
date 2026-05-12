'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Bookmark, LogOut, Menu, Search, ShieldCheck, User, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/auth.store';
import { notificationsService } from '@/services/notifications.service';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { href: '/browse', label: 'Browse' },
  { href: '/my-list', label: 'My List' },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsService.unreadCount,
    enabled: !!user,
    refetchInterval: 30 * 1000,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    clear();
    router.push('/login');
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-background/85 backdrop-blur-xl border-b border-white/5'
          : 'bg-gradient-to-b from-background/90 to-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-text',
                    active ? 'text-text' : 'text-text-muted',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className={cn(
                  'flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-emerald',
                  pathname.startsWith('/admin') ? 'text-emerald' : 'text-text-muted',
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden md:flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:bg-white/5 hover:text-text"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          <Link
            href="/notifications"
            className="relative hidden md:flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:bg-white/5 hover:text-text"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unread && unread.unread > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald shadow-glowEmerald" />
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full bg-surface/70 px-1.5 py-1 pr-3 text-sm hover:bg-surface"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-emerald text-xs font-bold text-background">
                  {user.displayName.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden sm:inline">{user.displayName}</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-strong rounded-xl py-2 shadow-card">
                  <div className="px-4 py-2 text-xs text-text-muted">
                    {user.email}
                    {user.role === 'admin' && (
                      <div className="mt-1">
                        <Badge tone="emerald">Admin</Badge>
                      </div>
                    )}
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5"
                  >
                    <User className="h-4 w-4" /> Profile
                  </Link>
                  <Link
                    href="/my-list"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5"
                  >
                    <Bookmark className="h-4 w-4" /> My List
                  </Link>
                  <Link
                    href="/notifications"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5"
                  >
                    <Bell className="h-4 w-4" /> Notifications
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                Sign in
              </Button>
              <Button size="sm" onClick={() => router.push('/register')}>
                Get started
              </Button>
            </div>
          )}

          <button
            className="md:hidden h-10 w-10 grid place-items-center rounded-full text-text-muted hover:bg-white/5"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-white/5 hover:text-text"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/notifications"
              className="rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-white/5 hover:text-text"
            >
              Notifications
            </Link>
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="rounded-lg px-3 py-2 text-sm text-emerald hover:bg-white/5"
              >
                Admin dashboard
              </Link>
            )}
            {!user && (
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                  Sign in
                </Button>
                <Button size="sm" onClick={() => router.push('/register')}>
                  Get started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
