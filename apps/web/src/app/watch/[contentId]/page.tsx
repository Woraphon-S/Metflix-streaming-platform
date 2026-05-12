'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FastForward, Info } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { moviesService } from '@/services/movies.service';
import { seriesService } from '@/services/series.service';
import { watchHistoryService } from '@/services/watch-history.service';
import { formatDuration } from '@/lib/format';

interface Parsed {
  type: 'movie' | 'episode';
  id: string;
}

const parseContentId = (raw: string): Parsed | null => {
  const decoded = decodeURIComponent(raw);
  if (decoded.startsWith('movie:')) return { type: 'movie', id: decoded.slice(6) };
  if (decoded.startsWith('episode:')) return { type: 'episode', id: decoded.slice(8) };
  return null;
};

export default function WatchPage({ params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = use(params);
  const parsed = parseContentId(contentId);
  const [initialSeconds, setInitialSeconds] = useState<number | undefined>();

  const movieQ = useQuery({
    queryKey: ['watch', 'movie', parsed?.id],
    queryFn: () => moviesService.detail(parsed!.id),
    enabled: !!parsed && parsed.type === 'movie',
  });

  const episodeQ = useQuery({
    queryKey: ['watch', 'episode', parsed?.id],
    queryFn: () => seriesService.episodeDetail(parsed!.id),
    enabled: !!parsed && parsed.type === 'episode',
  });

  const nextEpisodeQ = useQuery({
    queryKey: ['watch', 'next', parsed?.id],
    queryFn: () => seriesService.nextEpisode(parsed!.id),
    enabled: !!parsed && parsed.type === 'episode',
  });

  const progressQ = useQuery({
    queryKey: ['progress', parsed?.type, parsed?.id],
    queryFn: () =>
      watchHistoryService.getProgress(parsed!.type, parsed!.id),
    enabled: !!parsed,
  });

  useEffect(() => {
    if (progressQ.data?.progressSeconds) {
      setInitialSeconds(progressQ.data.progressSeconds);
    }
  }, [progressQ.data]);

  if (!parsed) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="mx-auto max-w-3xl px-4 pt-32 sm:px-6 lg:px-8">
            <h1 className="font-display text-2xl">Invalid content URL</h1>
            <p className="mt-2 text-text-muted">
              Expected format: /watch/movie:&lt;id&gt; or /watch/episode:&lt;id&gt;
            </p>
            <div className="mt-6">
              <Link href="/browse">
                <Button leading={<ArrowLeft className="h-4 w-4" />}>Back to browse</Button>
              </Link>
            </div>
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

  const isMovie = parsed.type === 'movie';
  const loading = isMovie ? movieQ.isLoading : episodeQ.isLoading;
  const data = isMovie ? movieQ.data : episodeQ.data;
  const title = data?.title ?? '';
  const videoUrl = data?.videoUrl;
  const posterUrl = isMovie ? movieQ.data?.posterUrl : episodeQ.data?.posterUrl;
  const description = isMovie
    ? movieQ.data?.description
    : episodeQ.data?.description ?? '';

  const seriesTitle =
    !isMovie && episodeQ.data
      ? (episodeQ.data as unknown as { series?: { title: string } }).series?.title
      : undefined;

  const handleProgress = (progressSeconds: number, durationSeconds: number) => {
    if (!parsed) return;
    void watchHistoryService.saveProgress({
      contentType: parsed.type,
      contentId: parsed.id,
      progressSeconds,
      durationSeconds,
    });
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={
                isMovie
                  ? `/movies/${parsed.id}`
                  : episodeQ.data
                  ? `/series/${episodeQ.data.seriesId}`
                  : '/browse'
              }
              className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text"
            >
              <ArrowLeft className="h-4 w-4" /> Back to details
            </Link>
            {!isMovie && nextEpisodeQ.data && (
              <Link href={`/watch/episode:${nextEpisodeQ.data.id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  trailing={<FastForward className="h-4 w-4" />}
                >
                  Next episode
                </Button>
              </Link>
            )}
          </div>

          {loading ? (
            <Skeleton className="aspect-video w-full" />
          ) : videoUrl ? (
            <VideoPlayer
              src={videoUrl}
              poster={posterUrl ?? null}
              title={title}
              initialSeconds={initialSeconds}
              onProgress={handleProgress}
            />
          ) : (
            <div className="aspect-video w-full grid place-items-center rounded-2xl border border-dashed border-white/10 bg-surface/40">
              <div className="text-center">
                <Info className="mx-auto h-8 w-8 text-warning" />
                <p className="mt-2 text-text-muted">
                  This title has no video source attached.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {seriesTitle && (
              <Badge tone="emerald">{seriesTitle}</Badge>
            )}
            <h1 className="font-display text-2xl font-bold text-balance">
              {title || 'Untitled'}
            </h1>
            {!isMovie && episodeQ.data && (
              <p className="text-sm text-text-muted">
                Episode {episodeQ.data.episodeNumber} · {formatDuration(episodeQ.data.durationSeconds)}
              </p>
            )}
            {description && (
              <p className="max-w-3xl text-text-muted">{description}</p>
            )}
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
