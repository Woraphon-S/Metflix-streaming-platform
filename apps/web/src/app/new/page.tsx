'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flame, Sparkles } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { MovieCard } from '@/components/cards/MovieCard';
import { SeriesCard } from '@/components/cards/SeriesCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { moviesService } from '@/services/movies.service';
import { seriesService } from '@/services/series.service';
import type { MovieSummary, SeriesSummary } from '@metflix/shared-types';

type CatalogItem = MovieSummary | SeriesSummary;

function CatalogCard({ item }: { item: CatalogItem }) {
  return 'seasonsCount' in item ? (
    <SeriesCard series={item} />
  ) : (
    <MovieCard movie={item} />
  );
}

function CardGrid({ items }: { items: CatalogItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
      {items.map((item) => (
        <CatalogCard key={`${'seasonsCount' in item ? 's' : 'm'}-${item.id}`} item={item} />
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
      ))}
    </div>
  );
}

export default function NewAndPopularPage() {
  const moviesQ = useQuery({
    queryKey: ['movies', 'all'],
    queryFn: () => moviesService.list({ page: 1, pageSize: 50 }),
  });
  const seriesQ = useQuery({
    queryKey: ['series', 'all'],
    queryFn: () => seriesService.list({ page: 1, pageSize: 50 }),
  });

  const isLoading = moviesQ.isLoading || seriesQ.isLoading;

  const all = useMemo<CatalogItem[]>(
    () => [...(moviesQ.data?.items ?? []), ...(seriesQ.data?.items ?? [])],
    [moviesQ.data, seriesQ.data],
  );

  const popular = useMemo(
    () => [...all].sort((a, b) => b.viewCount - a.viewCount).slice(0, 18),
    [all],
  );
  const newest = useMemo(
    () =>
      [...all]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 18),
    [all],
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-[1800px] space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 text-emerald">
            <Flame className="h-5 w-5" />
            <span className="text-xs uppercase tracking-wide">New &amp; Popular</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold">มาใหม่และกำลังฮิต</h1>
          <p className="text-text-muted">เรื่องที่กำลังเป็นกระแสและเพิ่งเข้าใหม่ในคลัง</p>
        </header>

        {isLoading ? (
          <GridSkeleton />
        ) : all.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-8 w-8" />}
            title="ยังไม่มีเนื้อหา"
            description="แอดมินต้องเผยแพร่ภาพยนตร์หรือซีรีส์ก่อน จึงจะแสดงที่นี่"
          />
        ) : (
          <>
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-emerald" />
                <h2 className="font-display text-xl font-semibold">กำลังฮิต</h2>
              </div>
              <CardGrid items={popular} />
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-400" />
                <h2 className="font-display text-xl font-semibold">มาใหม่ล่าสุด</h2>
              </div>
              <CardGrid items={newest} />
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
