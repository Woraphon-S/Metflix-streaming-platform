'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Tv } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import type { SeriesSummary } from '@metflix/shared-types';

interface SeriesCardProps {
  series: SeriesSummary;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SeriesCard({ series, className, size = 'md' }: SeriesCardProps) {
  const aspect = size === 'lg' ? 'aspect-[16/9]' : 'aspect-[2/3]';
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={cn('group relative overflow-hidden rounded-xl', className)}
    >
      <Link href={`/series/${series.id}`} className="block">
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-xl bg-surface/60 ring-1 ring-white/5 transition-shadow group-hover:ring-glow',
            aspect,
          )}
        >
          {(size === 'lg' ? series.backdropUrl : series.posterUrl) ? (
            <Image
              src={(size === 'lg' ? series.backdropUrl : series.posterUrl) as string}
              alt={series.title}
              fill
              sizes="(max-width: 768px) 50vw, 220px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-emerald/15 via-surface to-primary/15 text-3xl font-display">
              {series.title.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90" />
          <div className="absolute inset-0 flex items-end p-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Badge tone="emerald">Series</Badge>
                <Badge tone="neutral">
                  <Tv className="h-3 w-3" />
                  {series.seasonsCount} {series.seasonsCount === 1 ? 'season' : 'seasons'}
                </Badge>
              </div>
              <h3 className="font-display text-sm font-semibold leading-tight text-text line-clamp-2">
                {series.title}
              </h3>
              <p className="text-xs text-text-muted">
                {series.episodesCount} episodes
              </p>
            </div>
          </div>
          <div className="pointer-events-none absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-emerald/90 text-background opacity-0 shadow-glowEmerald transition-opacity group-hover:opacity-100">
            <Play className="h-4 w-4 fill-background" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
