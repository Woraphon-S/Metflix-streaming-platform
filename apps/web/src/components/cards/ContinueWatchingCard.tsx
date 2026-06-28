'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { formatProgressPercent } from '@/lib/format';
import type { WatchHistoryItem } from '@metflix/shared-types';

export function ContinueWatchingCard({ item }: { item: WatchHistoryItem }) {
  const isMovie = item.contentType === 'movie';
  const target = isMovie
    ? { href: `/watch/movie:${item.contentId}`, title: item.movie?.title ?? 'ภาพยนตร์' }
    : { href: `/watch/episode:${item.contentId}`, title: `${item.episode?.title ?? 'ตอน'}` };
  const subtitle = isMovie
    ? ''
    : (item.episode as (NonNullable<typeof item.episode> & { seriesTitle?: string }) | null)
        ?.seriesTitle ?? '';
  const cover = isMovie ? item.movie?.backdropUrl ?? item.movie?.posterUrl : item.episode?.posterUrl;
  const percent = formatProgressPercent(item.progressSeconds, item.durationSeconds);

  return (
    <Link
      href={target.href}
      className="group relative block overflow-hidden rounded-xl aspect-[16/9] ring-1 ring-white/5 transition-shadow hover:ring-glow"
    >
      {cover ? (
        <Image
          src={cover}
          alt={target.title}
          fill
          sizes="(max-width: 768px) 80vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-surface text-2xl">
          {target.title.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      <div className="absolute inset-x-3 bottom-3 space-y-2">
        <div className="text-xs uppercase tracking-wide text-emerald">
          {subtitle || (isMovie ? 'ภาพยนตร์' : 'ซีรีส์')}
        </div>
        <div className="font-display text-sm font-semibold leading-tight line-clamp-2">
          {target.title}
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-primary to-emerald"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <div className="pointer-events-none absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-emerald/90 text-background opacity-0 shadow-glowEmerald transition-opacity group-hover:opacity-100">
        <Play className="h-4 w-4 fill-background" />
      </div>
    </Link>
  );
}
