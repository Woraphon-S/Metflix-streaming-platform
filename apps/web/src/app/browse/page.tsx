'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Compass, ListVideo, Sparkles } from 'lucide-react';
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

export default function BrowsePage() {
  const user = useAuthStore((s) => s.user);

  const moviesQ = useQuery({
    queryKey: ['movies', 'browse'],
    queryFn: () => moviesService.list({ page: 1, pageSize: 20 }),
  });
  const seriesQ = useQuery({
    queryKey: ['series', 'browse'],
    queryFn: () => seriesService.list({ page: 1, pageSize: 20 }),
  });
  const continueQ = useQuery({
    queryKey: ['watch-history', 'continue'],
    queryFn: () => watchHistoryService.continueWatching(),
    enabled: !!user,
  });
  const myListQ = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => watchlistService.list(),
    enabled: !!user,
  });

  const featured =
    moviesQ.data?.items?.[0] ?? seriesQ.data?.items?.[0] ?? null;

  return (
    <AppShell>
      {moviesQ.isLoading || seriesQ.isLoading ? (
        <div className="h-[60vh] w-full bg-gradient-to-b from-surface/60 to-background animate-pulse" />
      ) : featured ? (
        <HeroBanner
          item={
            'durationSeconds' in featured
              ? { kind: 'movie' as const, ...featured }
              : { kind: 'series' as const, ...featured }
          }
        />
      ) : (
        <section className="px-4 pt-32 pb-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <EmptyState
            icon={<Sparkles className="h-8 w-8" />}
            title="No content yet"
            description="An admin needs to publish a movie or series to populate the catalog."
          />
        </section>
      )}

      <div className="mx-auto max-w-7xl space-y-10 px-4 pb-20 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {user && continueQ.data && continueQ.data.length > 0 && (
          <ContentCarousel
            title="Continue watching"
            subtitle="Pick up right where you left off"
          >
            {continueQ.data.map((item) => (
              <div key={item.id} className="w-[280px] flex-shrink-0 sm:w-[320px]">
                <ContinueWatchingCard item={item} />
              </div>
            ))}
          </ContentCarousel>
        )}

        <ContentCarousel
          title="Featured movies"
          subtitle="Cinematic picks from the catalog"
          action={
            <Link
              href="/browse"
              className="hidden text-xs uppercase tracking-wide text-primary-400 hover:text-primary sm:inline-flex"
            >
              See all
            </Link>
          }
        >
          {moviesQ.isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-[2/3] w-[150px] flex-shrink-0 sm:w-[180px]"
                />
              ))
            : moviesQ.data?.items.map((movie) => (
                <div
                  key={movie.id}
                  className="w-[150px] flex-shrink-0 sm:w-[180px]"
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
        </ContentCarousel>

        <ContentCarousel
          title="Series spotlight"
          subtitle="Binge a new universe tonight"
        >
          {seriesQ.isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-[2/3] w-[150px] flex-shrink-0 sm:w-[180px]"
                />
              ))
            : seriesQ.data?.items.map((s) => (
                <div key={s.id} className="w-[150px] flex-shrink-0 sm:w-[180px]">
                  <SeriesCard series={s} />
                </div>
              ))}
        </ContentCarousel>

        {moviesQ.data && moviesQ.data.items.length > 1 && (
          <ContentCarousel
            title="Trending now"
            subtitle="What everyone is streaming"
          >
            {[...moviesQ.data.items]
              .sort((a, b) => b.viewCount - a.viewCount)
              .slice(0, 8)
              .map((movie) => (
                <div
                  key={movie.id}
                  className="w-[280px] flex-shrink-0 sm:w-[320px]"
                >
                  <MovieCard movie={movie} size="lg" />
                </div>
              ))}
          </ContentCarousel>
        )}

        {user && myListQ.data && myListQ.data.length > 0 && (
          <ContentCarousel
            title="My List"
            subtitle="Saved for later"
            action={
              <Link
                href="/my-list"
                className="hidden text-xs uppercase tracking-wide text-emerald hover:brightness-110 sm:inline-flex"
              >
                Manage
              </Link>
            }
          >
            {myListQ.data.map((item) => (
              <div
                key={item.id}
                className="w-[150px] flex-shrink-0 sm:w-[180px]"
              >
                {item.contentType === 'movie' && item.movie && (
                  <MovieCard movie={item.movie} />
                )}
                {item.contentType === 'series' && item.series && (
                  <SeriesCard series={item.series} />
                )}
              </div>
            ))}
          </ContentCarousel>
        )}

        {!user && (
          <section className="glass rounded-3xl p-8 text-center">
            <Compass className="mx-auto h-10 w-10 text-emerald" />
            <h2 className="mt-3 font-display text-2xl font-bold">
              Sign in to unlock the full experience
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Save to My List, resume Continue Watching, and get notified when new content drops.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link
                href="/login"
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium hover:bg-primary-400"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm hover:bg-white/5"
              >
                Create account
              </Link>
            </div>
          </section>
        )}

        {moviesQ.data && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <ListVideo className="h-5 w-5 text-primary-400" />
              <h2 className="font-display text-xl font-semibold">
                Full catalog
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {moviesQ.data.items.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
              {seriesQ.data?.items.map((s) => (
                <SeriesCard key={s.id} series={s} />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
