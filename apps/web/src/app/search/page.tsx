'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { SearchX, Search as SearchIcon } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { MovieCard } from '@/components/cards/MovieCard';
import { SeriesCard } from '@/components/cards/SeriesCard';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { moviesService } from '@/services/movies.service';
import { seriesService } from '@/services/series.service';

const PAGE_SIZE = 24;

function SearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = (searchParams.get('q') ?? '').trim();

  const [mobileValue, setMobileValue] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => {
      const v = mobileValue.trim();
      router.replace(v ? `/search?q=${encodeURIComponent(v)}` : '/search', {
        scroll: false,
      });
    }, 300);
    return () => clearTimeout(t);
  }, [mobileValue, router]);

  const enabled = q.length > 0;

  const moviesQ = useQuery({
    queryKey: ['search', 'movies', q],
    queryFn: () => moviesService.list({ page: 1, pageSize: PAGE_SIZE, search: q }),
    enabled,
  });
  const seriesQ = useQuery({
    queryKey: ['search', 'series', q],
    queryFn: () => seriesService.list({ page: 1, pageSize: PAGE_SIZE, search: q }),
    enabled,
  });

  const movies = useMemo(() => moviesQ.data?.items ?? [], [moviesQ.data]);
  const series = useMemo(() => seriesQ.data?.items ?? [], [seriesQ.data]);
  const total = movies.length + series.length;
  const isLoading = enabled && (moviesQ.isLoading || seriesQ.isLoading);

  return (
    <div className="mx-auto max-w-[1800px] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <div className="mb-8 md:hidden">
        <Input
          name="search"
          autoComplete="off"
          placeholder="ค้นหาหนัง ซีรีส์..."
          leading={<SearchIcon className="h-4 w-4" />}
          value={mobileValue}
          onChange={(e) => setMobileValue(e.target.value)}
        />
      </div>

      {!enabled ? (
        <EmptyState
          icon={<SearchIcon className="h-8 w-8" />}
          title="ค้นหา METFLIX"
          description="ค้นหาภาพยนตร์และซีรีส์จากชื่อเรื่อง เริ่มพิมพ์ได้เลย"
        />
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
          ))}
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={<SearchX className="h-8 w-8" />}
          title={`ไม่พบผลลัพธ์สำหรับ “${q}”`}
          description="ลองใช้ชื่อเรื่องอื่น หรือตรวจสอบการสะกดอีกครั้ง"
        />
      ) : (
        <section className="space-y-4">
          <p className="text-sm text-text-muted">
            พบ {total} รายการสำหรับ{' '}
            <span className="font-medium text-text">“{q}”</span>
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
            {series.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="mx-auto max-w-[1800px] px-4 pt-8 sm:px-6 lg:px-8">
            <Skeleton className="h-10 w-full max-w-md rounded-xl" />
          </div>
        }
      >
        <SearchView />
      </Suspense>
    </AppShell>
  );
}
