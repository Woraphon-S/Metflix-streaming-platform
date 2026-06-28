'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Info, Play } from 'lucide-react';
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

      <div className="relative mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 pt-32 pb-20 md:pt-44 md:pb-32">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-2xl space-y-5"
        >
          <h1 className="font-display text-4xl font-extrabold leading-tight text-balance sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-text via-primary-100 to-emerald bg-clip-text text-transparent">
              {item.title}
            </span>
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-xl line-clamp-3">
            {description ||
              'ตัวอย่างภาพยนตร์สุดอลังการที่รออยู่ในคลังของ METFLIX กดเล่นเพื่อเริ่มรับชม'}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href={watchHref}>
              <Button variant="emerald" size="lg" leading={<Play className="h-4 w-4 fill-background" />}>
                เล่นเลย
              </Button>
            </Link>
            <Link href={detailHref}>
              <Button variant="ghost" size="lg" leading={<Info className="h-4 w-4" />}>
                ข้อมูลเพิ่มเติม
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
