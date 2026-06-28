'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tv } from 'lucide-react';
import { HighlightBadge } from './HighlightBadge';
import { HoverPreview } from './HoverPreview';
import { cn } from '@/lib/cn';
import type { SeriesSummary } from '@metflix/shared-types';

interface SeriesCardProps {
  series: SeriesSummary;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SeriesCard({ series, className, size = 'md' }: SeriesCardProps) {
  const landscape = size === 'lg';
  const aspect = landscape ? 'aspect-[16/9]' : 'aspect-[2/3]';
  const img = landscape ? series.backdropUrl ?? series.posterUrl : series.posterUrl;

  return (
    <HoverPreview
      image={series.backdropUrl ?? series.posterUrl}
      title={series.title}
      highlight={series.highlight}
      description={series.description}
      playHref={`/series/${series.id}`}
      detailHref={`/series/${series.id}`}
      contentType="series"
      contentId={series.id}
      meta={
        <>
          <Tv className="h-3 w-3" />
          {series.seasonsCount} ซีซัน · {series.episodesCount} ตอน
        </>
      }
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        className={cn('group relative', className)}
      >
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-xl bg-surface/60 ring-1 ring-white/5 transition-shadow group-hover:ring-glow',
            aspect,
          )}
        >
          {img ? (
            <Image
              src={img}
              alt={series.title}
              fill
              sizes="(max-width: 768px) 50vw, 320px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-emerald/15 via-surface to-primary/15 text-3xl font-display">
              {series.title.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

          <Link
            href={`/series/${series.id}`}
            aria-label={series.title}
            className="absolute inset-0"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 space-y-1 p-3">
            <HighlightBadge highlight={series.highlight} />
            <h3 className="font-display text-sm font-semibold leading-tight text-text line-clamp-2">
              {series.title}
            </h3>
          </div>
        </div>
      </motion.div>
    </HoverPreview>
  );
}
