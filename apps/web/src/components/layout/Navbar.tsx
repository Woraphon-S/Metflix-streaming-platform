'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Bookmark, LogOut, Menu, Search, ShieldCheck, User, UserCog, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { useAuthStore } from '@/stores/auth.store';
import { notificationsService } from '@/services/notifications.service';
import { profilesService } from '@/services/profiles.service';
import { cn } from '@/lib/cn';
import type { Profile } from '@metflix/shared-types';

const NAV_LINKS = [
  { href: '/browse', label: 'หน้าหลัก' },
  { href: '/series', label: 'ซีรีส์' },
  { href: '/movies', label: 'ภาพยนตร์' },
  { href: '/new', label: 'มาใหม่และกำลังฮิต' },
  { href: '/my-list', label: 'รายการของฉัน' },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const activeProfile = useAuthStore((s) => s.activeProfile);
  const setActiveProfile = useAuthStore((s) => s.setActiveProfile);
  const qc = useQueryClient();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushSearch = (value: string) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const q = value.trim();
      const href = q ? `/search?q=${encodeURIComponent(q)}` : '/search';
      if (pathname === '/search') router.replace(href);
      else router.push(href);
    }, 350);
  };

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 10);
  };

  const closeSearch = () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setSearchValue('');
    setSearchOpen(false);
  };

  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsService.unreadCount,
    enabled: !!user,
    refetchInterval: 30 * 1000,
  });

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: profilesService.list,
    enabled: !!user,
  });

  const switchProfile = (profile: Profile) => {
    setActiveProfile(profile);
    qc.invalidateQueries();
    setProfileOpen(false);
    router.push('/browse');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    if (pathname === '/search') {
      setSearchOpen(true);
      const urlQ = new URLSearchParams(window.location.search).get('q') ?? '';
      setSearchValue((v) => v || urlQ);
    } else {
      setSearchOpen(false);
      setSearchValue('');
    }
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
      <div className="mx-auto flex h-16 max-w-[1800px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
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
                  'flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-text',
                  pathname.startsWith('/admin') ? 'text-text' : 'text-text-muted',
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                ผู้ดูแล
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center">
            <AnimatePresence initial={false}>
              {searchOpen && (
                <motion.input
                  ref={searchRef}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 224, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    pushSearch(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') closeSearch();
                  }}
                  placeholder="ค้นหาหนัง ซีรีส์..."
                  className="mr-1 rounded-full border border-white/10 bg-surface/80 px-4 py-2 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => (searchOpen ? closeSearch() : openSearch())}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/5 hover:text-text',
                searchOpen || pathname.startsWith('/search') ? 'text-text' : 'text-text-muted',
              )}
              aria-label="ค้นหา"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          <Link
            href="/notifications"
            className="relative hidden md:flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:bg-white/5 hover:text-text"
            aria-label="การแจ้งเตือน"
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
                <ProfileAvatar
                  displayName={activeProfile?.displayName ?? user.displayName}
                  avatarKey={activeProfile?.avatarKey}
                  size="sm"
                  className="h-7 w-7 text-xs"
                />
                <span className="hidden sm:inline">
                  {activeProfile?.displayName ?? user.displayName}
                </span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-60 glass-strong rounded-xl py-2 shadow-card">
                  <div className="px-4 py-2 text-xs text-text-muted">
                    {user.email}
                    {user.role === 'admin' && (
                      <div className="mt-1">
                        <Badge tone="neutral">ผู้ดูแล</Badge>
                      </div>
                    )}
                  </div>

                  {profiles && profiles.length > 0 && (
                    <div className="border-y border-white/5 py-1.5">
                      <p className="px-4 py-1 text-[10px] uppercase tracking-wide text-text-subtle">
                        สลับโปรไฟล์
                      </p>
                      {profiles.map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => switchProfile(profile)}
                          className={cn(
                            'flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-white/5',
                            activeProfile?.id === profile.id && 'text-emerald',
                          )}
                        >
                          <ProfileAvatar
                            displayName={profile.displayName}
                            avatarKey={profile.avatarKey}
                            size="sm"
                            className="h-6 w-6 text-[10px]"
                          />
                          <span className="truncate">{profile.displayName}</span>
                        </button>
                      ))}
                      <Link
                        href="/profiles/manage"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:bg-white/5 hover:text-text"
                      >
                        <UserCog className="h-4 w-4" /> จัดการโปรไฟล์
                      </Link>
                    </div>
                  )}

                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5"
                  >
                    <User className="h-4 w-4" /> บัญชี
                  </Link>
                  <Link
                    href="/my-list"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5"
                  >
                    <Bookmark className="h-4 w-4" /> รายการของฉัน
                  </Link>
                  <Link
                    href="/notifications"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5"
                  >
                    <Bell className="h-4 w-4" /> การแจ้งเตือน
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4" /> ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                เข้าสู่ระบบ
              </Button>
              <Button size="sm" onClick={() => router.push('/register')}>
                เริ่มต้นใช้งาน
              </Button>
            </div>
          )}

          <button
            className="md:hidden h-10 w-10 grid place-items-center rounded-full text-text-muted hover:bg-white/5"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="เมนู"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl">
          <div className="mx-auto max-w-[1800px] px-4 py-3 flex flex-col gap-1">
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
              href="/search"
              className="rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-white/5 hover:text-text"
            >
              ค้นหา
            </Link>
            <Link
              href="/notifications"
              className="rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-white/5 hover:text-text"
            >
              การแจ้งเตือน
            </Link>
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="rounded-lg px-3 py-2 text-sm text-text hover:bg-white/5"
              >
                แดชบอร์ดผู้ดูแล
              </Link>
            )}
            {!user && (
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                  เข้าสู่ระบบ
                </Button>
                <Button size="sm" onClick={() => router.push('/register')}>
                  เริ่มต้นใช้งาน
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
