'use client';

import { use, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, BookmarkCheck, Calendar, Play, Star, Tv } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { seriesService } from '@/services/series.service';
import { watchlistService } from '@/services/watchlist.service';
import { formatDuration, formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';

export default function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const [activeSeason, setActiveSeason] = useState<string | null>(null);

  const seriesQ = useQuery({
    queryKey: ['series', id],
    queryFn: () => seriesService.detail(id),
  });

  const statusQ = useQuery({
    queryKey: ['watchlist', 'status', 'series', id],
    queryFn: () => watchlistService.status('series', id),
  });

  const toggleList = useMutation({
    mutationFn: async () => {
      if (statusQ.data?.inWatchlist) {
        await watchlistService.remove('series', id);
      } else {
        await watchlistService.add('series', id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist'] });
      qc.invalidateQueries({ queryKey: ['watchlist', 'status', 'series', id] });
    },
  });

  const seasons = seriesQ.data?.seasons ?? [];
  const currentSeason = useMemo(() => {
    if (!seasons.length) return null;
    if (activeSeason) return seasons.find((s) => s.id === activeSeason) ?? seasons[0];
    return seasons[0];
  }, [seasons, activeSeason]);

  const firstEpisode = currentSeason?.episodes?.[0];

  return (
    <AuthGuard>
      <AppShell>
        {seriesQ.isLoading ? (
          <div className="px-4 sm:px-6 lg:px-8 pt-24">
            <Skeleton className="h-[50vh] w-full" />
          </div>
        ) : seriesQ.data ? (
          <>
            <section className="relative isolate min-h-[55vh] overflow-hidden">
              <div className="absolute inset-0 -z-10">
                {seriesQ.data.backdropUrl && (
                  <Image
                    src={seriesQ.data.backdropUrl}
                    alt={seriesQ.data.title}
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
                  {seriesQ.data.posterUrl && (
                    <div className="relative hidden h-[360px] w-[240px] flex-shrink-0 overflow-hidden rounded-2xl shadow-card ring-1 ring-white/10 md:block">
                      <Image
                        src={seriesQ.data.posterUrl}
                        alt={seriesQ.data.title}
                        fill
                        sizes="240px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="max-w-2xl space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="emerald">Series</Badge>
                      <Badge tone="neutral">
                        <Tv className="h-3 w-3" />
                        {seasons.length} {seasons.length === 1 ? 'season' : 'seasons'}
                      </Badge>
                      <Badge tone="primary">
                        <Star className="h-3 w-3" />
                        {formatNumber(seriesQ.data.viewCount)} views
                      </Badge>
                    </div>
                    <h1 className="font-display text-3xl font-extrabold sm:text-4xl md:text-5xl text-balance">
                      {seriesQ.data.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(seriesQ.data.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-text-muted text-balance">
                      {seriesQ.data.description ||
                        'A multi-season journey waiting in the METFLIX catalog.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {firstEpisode && (
                        <Link href={`/watch/episode:${firstEpisode.id}`}>
                          <Button
                            variant="emerald"
                            size="lg"
                            leading={<Play className="h-4 w-4 fill-background" />}
                          >
                            Play S{currentSeason?.seasonNumber} E{firstEpisode.episodeNumber}
                          </Button>
                        </Link>
                      )}
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

            <section className="mx-auto max-w-7xl space-y-6 px-4 pb-16 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-xl font-semibold">Episodes</h2>
                {seasons.length > 1 && (
                  <div className="flex flex-wrap gap-1.5">
                    {seasons.map((season) => {
                      const active = (currentSeason?.id ?? seasons[0].id) === season.id;
                      return (
                        <button
                          key={season.id}
                          onClick={() => setActiveSeason(season.id)}
                          className={cn(
                            'rounded-full px-3.5 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors',
                            active
                              ? 'bg-primary text-white shadow-glow'
                              : 'bg-surface/60 text-text-muted hover:bg-surface',
                          )}
                        >
                          Season {season.seasonNumber}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {currentSeason?.episodes.length ? (
                <ul className="grid gap-3 md:grid-cols-2">
                  {currentSeason.episodes.map((ep) => (
                    <li key={ep.id}>
                      <Link
                        href={`/watch/episode:${ep.id}`}
                        className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-surface/40 p-3 transition-all hover:bg-surface hover:ring-glow"
                      >
                        <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-background ring-1 ring-white/10">
                          {ep.posterUrl ? (
                            <Image
                              src={ep.posterUrl}
                              alt={ep.title}
                              fill
                              sizes="160px"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-xs text-text-muted">
                              S{currentSeason.seasonNumber}E{ep.episodeNumber}
                            </div>
                          )}
                          <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald/90 text-background shadow-glowEmerald">
                              <Play className="h-4 w-4 fill-background" />
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs text-text-subtle">
                            <span>S{currentSeason.seasonNumber} · E{ep.episodeNumber}</span>
                            <span>·</span>
                            <span>{formatDuration(ep.durationSeconds)}</span>
                          </div>
                          <h3 className="font-display text-sm font-semibold leading-tight line-clamp-1">
                            {ep.title}
                          </h3>
                          {ep.description && (
                            <p className="mt-1 text-xs text-text-muted line-clamp-2">
                              {ep.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-muted">No episodes available in this season yet.</p>
              )}
            </section>
          </>
        ) : (
          <div className="mx-auto max-w-3xl px-4 pt-32 sm:px-6 lg:px-8">
            <h1 className="font-display text-2xl">Series not found</h1>
          </div>
        )}
      </AppShell>
    </AuthGuard>
  );
}
