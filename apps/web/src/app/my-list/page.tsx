'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Bookmark, Compass } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { MovieCard } from '@/components/cards/MovieCard';
import { SeriesCard } from '@/components/cards/SeriesCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { watchlistService } from '@/services/watchlist.service';

export default function MyListPage() {
  const listQ = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => watchlistService.list(),
  });

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
          <header className="space-y-2">
            <div className="inline-flex items-center gap-2 text-emerald">
              <Bookmark className="h-5 w-5" />
              <span className="text-xs uppercase tracking-wide">Your watchlist</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold">My List</h1>
            <p className="text-text-muted">
              Everything you have saved to watch later, in one place.
            </p>
          </header>

          {listQ.isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] w-full" />
              ))}
            </div>
          ) : listQ.data && listQ.data.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {listQ.data.map((item) => (
                <div key={item.id}>
                  {item.contentType === 'movie' && item.movie && (
                    <MovieCard movie={item.movie} />
                  )}
                  {item.contentType === 'series' && item.series && (
                    <SeriesCard series={item.series} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Compass className="h-8 w-8" />}
              title="Your list is empty"
              description="Browse the catalog and tap Add to My List on anything you want to come back to."
              action={
                <Link href="/browse">
                  <Button variant="emerald">Discover content</Button>
                </Link>
              }
            />
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
