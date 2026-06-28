'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { HighlightBadge } from './HighlightBadge';
import { HoverPreview } from './HoverPreview';
import { formatDuration } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { MovieSummary } from '@metflix/shared-types';

interface MovieCardProps {
  movie: MovieSummary;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MovieCard({ movie, className, size = 'md' }: MovieCardProps) {
  const landscape = size === 'lg';
  const aspect = landscape ? 'aspect-[16/9]' : 'aspect-[2/3]';
  const img = landscape ? movie.backdropUrl ?? movie.posterUrl : movie.posterUrl;

  return (
    <HoverPreview
      image={movie.backdropUrl ?? movie.posterUrl}
      title={movie.title}
      highlight={movie.highlight}
      description={movie.description}
      playHref={`/watch/movie:${movie.id}`}
      detailHref={`/movies/${movie.id}`}
      contentType="movie"
      contentId={movie.id}
      meta={
        <>
          <Clock className="h-3 w-3" />
          {formatDuration(movie.durationSeconds)}
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
              alt={movie.title}
              fill
              sizes="(max-width: 768px) 50vw, 320px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary/20 via-surface to-emerald/10 text-3xl font-display">
              {movie.title.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

          <Link
            href={`/movies/${movie.id}`}
            aria-label={movie.title}
            className="absolute inset-0"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 space-y-1 p-3">
            <HighlightBadge highlight={movie.highlight} />
            <h3 className="font-display text-sm font-semibold leading-tight text-text line-clamp-2">
              {movie.title}
            </h3>
          </div>
        </div>
      </motion.div>
    </HoverPreview>
  );
}
