'use client';

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, BookmarkCheck, Calendar, Clock, Play, Star } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { moviesService } from '@/services/movies.service';
import { watchlistService } from '@/services/watchlist.service';
import { formatDuration, formatNumber } from '@/lib/format';

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();

  const movieQ = useQuery({
    queryKey: ['movie', id],
    queryFn: () => moviesService.detail(id),
  });

  const statusQ = useQuery({
    queryKey: ['watchlist', 'status', 'movie', id],
    queryFn: () => watchlistService.status('movie', id),
  });

  const toggleList = useMutation({
    mutationFn: async () => {
      if (statusQ.data?.inWatchlist) {
        await watchlistService.remove('movie', id);
      } else {
        await watchlistService.add('movie', id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist'] });
      qc.invalidateQueries({ queryKey: ['watchlist', 'status', 'movie', id] });
    },
  });

  return (
    <AuthGuard>
      <AppShell>
        {movieQ.isLoading ? (
          <div className="px-4 sm:px-6 lg:px-8 pt-24">
            <Skeleton className="h-[50vh] w-full" />
          </div>
        ) : movieQ.data ? (
          <>
            <section className="relative isolate min-h-[60vh] overflow-hidden">
              <div className="absolute inset-0 -z-10">
                {movieQ.data.backdropUrl && (
                  <Image
                    src={movieQ.data.backdropUrl}
                    alt={movieQ.data.title}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-hero-vignette" />
                <div className="absolute inset-0 bg-background/40" />
              </div>
              <div className="mx-auto max-w-7xl px-4 pt-32 pb-12 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 md:flex-row md:items-end">
                  {movieQ.data.posterUrl && (
                    <div className="relative hidden h-[360px] w-[240px] flex-shrink-0 overflow-hidden rounded-2xl shadow-card ring-1 ring-white/10 md:block">
                      <Image
                        src={movieQ.data.posterUrl}
                        alt={movieQ.data.title}
                        fill
                        sizes="240px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="max-w-2xl space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="primary">Movie</Badge>
                      <Badge tone="neutral">{movieQ.data.maturityRating}</Badge>
                      <Badge tone="emerald">
                        <Star className="h-3 w-3" />
                        {formatNumber(movieQ.data.viewCount)} views
                      </Badge>
                    </div>
                    <h1 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl text-balance">
                      {movieQ.data.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(movieQ.data.durationSeconds)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(movieQ.data.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-text-muted text-balance">
                      {movieQ.data.description ||
                        'A captivating addition to the METFLIX catalog. Hit play to start watching.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link href={`/watch/movie:${movieQ.data.id}`}>
                        <Button
                          variant="emerald"
                          size="lg"
                          leading={<Play className="h-4 w-4 fill-background" />}
                        >
                          Play movie
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="lg"
                        leading={
                          statusQ.data?.inWatchlist ? (
                            <BookmarkCheck className="h-4 w-4 text-emerald" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )
                        }
                        onClick={() => toggleList.mutate()}
                        loading={toggleList.isPending}
                      >
                        {statusQ.data?.inWatchlist ? 'In My List' : 'Add to My List'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {movieQ.data.trailerUrl && (
              <section className="mx-auto max-w-5xl space-y-3 px-4 pb-16 sm:px-6 lg:px-8">
                <h2 className="font-display text-xl font-semibold">Trailer</h2>
                <video
                  src={movieQ.data.trailerUrl}
                  controls
                  className="aspect-video w-full rounded-2xl bg-black"
                />
              </section>
            )}
          </>
        ) : (
          <div className="mx-auto max-w-3xl px-4 pt-32 sm:px-6 lg:px-8">
            <h1 className="font-display text-2xl">Movie not found</h1>
          </div>
        )}
      </AppShell>
    </AuthGuard>
  );
}
