'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { HeroBanner } from '@/components/hero/HeroBanner';
import { ContentCarousel } from '@/components/carousel/ContentCarousel';
import { MovieCard } from '@/components/cards/MovieCard';
import { SeriesCard } from '@/components/cards/SeriesCard';
import { ContinueWatchingCard } from '@/components/cards/ContinueWatchingCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { moviesService } from '@/services/movies.service';
import { seriesService } from '@/services/series.service';
import { watchHistoryService } from '@/services/watch-history.service';
import { watchlistService } from '@/services/watchlist.service';
import { useAuthStore } from '@/stores/auth.store';
import { GENRE_LABELS, GENRE_ORDER } from '@/lib/genres';
import type { MovieSummary, SeriesSummary } from '@metflix/shared-types';

type CatalogItem = MovieSummary | SeriesSummary;

function PortraitCard({ item }: { item: CatalogItem }) {
  return 'seasonsCount' in item ? (
    <SeriesCard series={item} />
  ) : (
    <MovieCard movie={item} />
  );
}

const LANDSCAPE_W = 'w-[260px] flex-shrink-0 sm:w-[300px]';
const LANDSCAPE_SKELETON = `${LANDSCAPE_W} aspect-[16/9] rounded-xl`;

export default function BrowsePage() {
  const user = useAuthStore((s) => s.user);
  const activeProfile = useAuthStore((s) => s.activeProfile);

  const moviesQ = useQuery({
    queryKey: ['movies', 'browse'],
    queryFn: () => moviesService.list({ page: 1, pageSize: 30 }),
  });
  const seriesQ = useQuery({
    queryKey: ['series', 'browse'],
    queryFn: () => seriesService.list({ page: 1, pageSize: 30 }),
  });
  const continueQ = useQuery({
    queryKey: ['watch-history', 'continue', activeProfile?.id],
    queryFn: () => watchHistoryService.continueWatching(),
    enabled: !!user && !!activeProfile,
  });
  const myListQ = useQuery({
    queryKey: ['watchlist', activeProfile?.id],
    queryFn: () => watchlistService.list(),
    enabled: !!user && !!activeProfile,
  });

  const movies = moviesQ.data?.items ?? [];
  const series = seriesQ.data?.items ?? [];
  const featured = movies[0] ?? series[0] ?? null;
  const loading = moviesQ.isLoading || seriesQ.isLoading;

  const topTen = useMemo<CatalogItem[]>(
    () =>
      [...movies, ...series].sort((a, b) => b.viewCount - a.viewCount).slice(0, 10),
    [movies, series],
  );

  const genreRows = useMemo(() => {
    const groups = new Map<string, CatalogItem[]>();
    for (const item of [...movies, ...series]) {
      const list = groups.get(item.genre) ?? [];
      list.push(item);
      groups.set(item.genre, list);
    }
    return GENRE_ORDER.map((genre) => ({ genre, items: groups.get(genre) ?? [] })).filter(
      (row) => row.items.length > 0,
    );
  }, [movies, series]);

  return (
    <AppShell>
      {loading ? (
        <div className="h-[60vh] w-full bg-gradient-to-b from-surface/60 to-background animate-pulse" />
      ) : featured ? (
        <HeroBanner
          item={
            'durationSeconds' in featured
              ? { kind: 'movie' as const, ...(featured as MovieSummary) }
              : { kind: 'series' as const, ...(featured as SeriesSummary) }
          }
        />
      ) : (
        <section className="mx-auto max-w-[1800px] px-4 pt-32 pb-16 sm:px-6 lg:px-8">
          <EmptyState
            icon={<Compass className="h-8 w-8" />}
            title="ยังไม่มีเนื้อหา"
            description="ผู้ดูแลต้องเผยแพร่ภาพยนตร์หรือซีรีส์ก่อน จึงจะแสดงที่นี่"
          />
        </section>
      )}

      <div className="relative z-10 mx-auto -mt-8 max-w-[1800px] space-y-12 px-4 pb-20 sm:px-6 lg:px-8">
        {topTen.length > 0 && (
          <ContentCarousel
            title="10 อันดับสูงสุดในไทยวันนี้"
            subtitle="เรื่องที่มีคนดูมากที่สุด"
          >
            {topTen.map((item, i) => (
              <div
                key={`${'seasonsCount' in item ? 's' : 'm'}-${item.id}`}
                className="relative flex-shrink-0 pl-[3rem] sm:pl-[4rem]"
              >
                <span className="pointer-events-none absolute bottom-0 left-0 z-0 select-none font-display font-black leading-[0.72] text-transparent text-[7rem] sm:text-[9rem] [-webkit-text-stroke:3px_rgba(148,163,184,0.5)]">
                  {i + 1}
                </span>
                <div className="relative z-10 w-[130px] sm:w-[160px]">
                  <PortraitCard item={item} />
                </div>
              </div>
            ))}
          </ContentCarousel>
        )}

        {user && continueQ.data && continueQ.data.length > 0 && (
          <ContentCarousel title="ดูต่อ" subtitle="ดูต่อจากที่ค้างไว้">
            {continueQ.data.map((item) => (
              <div key={item.id} className={LANDSCAPE_W}>
                <ContinueWatchingCard item={item} />
              </div>
            ))}
          </ContentCarousel>
        )}

        {loading && (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className={LANDSCAPE_SKELETON} />
            ))}
          </div>
        )}

        {genreRows.map((row) => (
          <ContentCarousel key={row.genre} title={GENRE_LABELS[row.genre]}>
            {row.items.map((item) => (
              <div
                key={`${'seasonsCount' in item ? 's' : 'm'}-${item.id}`}
                className={LANDSCAPE_W}
              >
                {'seasonsCount' in item ? (
                  <SeriesCard series={item} size="lg" />
                ) : (
                  <MovieCard movie={item} size="lg" />
                )}
              </div>
            ))}
          </ContentCarousel>
        ))}

        {user && myListQ.data && myListQ.data.length > 0 && (
          <ContentCarousel
            title="รายการของฉัน"
            subtitle="บันทึกไว้ดูภายหลัง"
            action={
              <Link
                href="/my-list"
                className="hidden text-xs uppercase tracking-wide text-emerald hover:brightness-110 sm:inline-flex"
              >
                จัดการ
              </Link>
            }
          >
            {myListQ.data.map((item) => (
              <div key={item.id} className={LANDSCAPE_W}>
                {item.contentType === 'movie' && item.movie && (
                  <MovieCard movie={item.movie} size="lg" />
                )}
                {item.contentType === 'series' && item.series && (
                  <SeriesCard series={item.series} size="lg" />
                )}
              </div>
            ))}
          </ContentCarousel>
        )}

        {!user && (
          <section className="glass rounded-3xl p-8 text-center">
            <Compass className="mx-auto h-10 w-10 text-emerald" />
            <h2 className="mt-3 font-display text-2xl font-bold">
              เข้าสู่ระบบเพื่อปลดล็อกประสบการณ์เต็มรูปแบบ
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              บันทึกในรายการของฉัน ดูต่อจากที่ค้าง และรับการแจ้งเตือนเมื่อมีเนื้อหาใหม่
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link
                href="/login"
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium hover:bg-primary-400"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm hover:bg-white/5"
              >
                สร้างบัญชี
              </Link>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
