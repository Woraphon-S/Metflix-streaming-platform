'use client';

import { useQuery } from '@tanstack/react-query';
import { Film } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { MovieCard } from '@/components/cards/MovieCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { moviesService } from '@/services/movies.service';

export default function MoviesPage() {
  const moviesQ = useQuery({
    queryKey: ['movies', 'all'],
    queryFn: () => moviesService.list({ page: 1, pageSize: 50 }),
  });
  const items = moviesQ.data?.items ?? [];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1800px] space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 text-primary-400">
            <Film className="h-5 w-5" />
            <span className="text-xs uppercase tracking-wide">Movies</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold">ภาพยนตร์</h1>
          <p className="text-text-muted">ภาพยนตร์ทั้งหมดในคลัง METFLIX</p>
        </header>

        {moviesQ.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
            {items.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Film className="h-8 w-8" />}
            title="ยังไม่มีภาพยนตร์"
            description="แอดมินต้องเผยแพร่ภาพยนตร์ก่อน จึงจะแสดงที่นี่"
          />
        )}
      </div>
    </AppShell>
  );
}
