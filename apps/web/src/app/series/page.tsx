'use client';

import { useQuery } from '@tanstack/react-query';
import { Tv } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { SeriesCard } from '@/components/cards/SeriesCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { seriesService } from '@/services/series.service';

export default function SeriesListPage() {
  const seriesQ = useQuery({
    queryKey: ['series', 'all'],
    queryFn: () => seriesService.list({ page: 1, pageSize: 50 }),
  });
  const items = seriesQ.data?.items ?? [];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1800px] space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 text-emerald">
            <Tv className="h-5 w-5" />
            <span className="text-xs uppercase tracking-wide">Series</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold">ซีรีส์</h1>
          <p className="text-text-muted">ซีรีส์ทั้งหมดในคลัง METFLIX</p>
        </header>

        {seriesQ.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
            {items.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Tv className="h-8 w-8" />}
            title="ยังไม่มีซีรีส์"
            description="แอดมินต้องเผยแพร่ซีรีส์ก่อน จึงจะแสดงที่นี่"
          />
        )}
      </div>
    </AppShell>
  );
}
