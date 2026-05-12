'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Info, Play } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { MovieSummary, SeriesSummary } from '@metflix/shared-types';

type FeaturedItem =
  | ({ kind: 'movie' } & MovieSummary)
  | ({ kind: 'series' } & SeriesSummary);

export function HeroBanner({ item }: { item: FeaturedItem }) {
  const backdrop = item.backdropUrl ?? item.posterUrl;
  const description = item.description ?? '';
  const detailHref =
    item.kind === 'movie' ? `/movies/${item.id}` : `/series/${item.id}`;
  const watchHref =
    item.kind === 'movie' ? `/watch/movie:${item.id}` : `/series/${item.id}`;

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {backdrop ? (
          <Image
            src={backdrop}
            alt={item.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/30 via-background to-emerald/15" />
        )}
        <div className="absolute inset-0 bg-hero-vignette" />
        <div className="absolute inset-0 bg-background/40 mix-blend-multiply" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20 md:pt-44 md:pb-32">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-2xl space-y-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="emerald">Featured</Badge>
            <Badge tone="primary">{item.kind === 'movie' ? 'Movie' : 'Series'}</Badge>
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-balance sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-text via-primary-100 to-emerald bg-clip-text text-transparent">
              {item.title}
            </span>
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-xl line-clamp-3">
            {description ||
              'A cinematic preview of what awaits in the METFLIX catalog. Press play to dive in.'}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href={watchHref}>
              <Button variant="emerald" size="lg" leading={<Play className="h-4 w-4 fill-background" />}>
                Play now
              </Button>
            </Link>
            <Link href={detailHref}>
              <Button variant="ghost" size="lg" leading={<Info className="h-4 w-4" />}>
                More info
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
