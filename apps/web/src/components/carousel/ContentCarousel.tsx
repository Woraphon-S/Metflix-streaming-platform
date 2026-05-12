'use client';

import { useRef, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ContentCarouselProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function ContentCarousel({ title, subtitle, action, children }: ContentCarouselProps) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 'left' | 'right') => {
    const rail = railRef.current;
    if (!rail) return;
    const width = rail.clientWidth * 0.85;
    rail.scrollBy({
      left: direction === 'left' ? -width : width,
      behavior: 'smooth',
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold sm:text-2xl">{title}</h2>
          {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {action}
          <button
            type="button"
            onClick={() => scrollBy('left')}
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-surface/70 text-text-muted hover:bg-surface md:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy('right')}
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-surface/70 text-text-muted hover:bg-surface md:flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div
        ref={railRef}
        className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:gap-4 sm:px-0"
      >
        {children}
      </div>
    </section>
  );
}
