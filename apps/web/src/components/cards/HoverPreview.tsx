'use client';

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Play, Plus } from 'lucide-react';
import { HighlightBadge } from './HighlightBadge';
import { watchlistService } from '@/services/watchlist.service';
import type { ContentHighlight } from '@metflix/shared-types';

interface HoverPreviewProps {
  children: ReactNode;
  image: string | null;
  title: string;
  highlight?: ContentHighlight | null;
  meta: ReactNode;
  description?: string | null;
  playHref: string;
  detailHref: string;
  contentType: 'movie' | 'series';
  contentId: string;
}

const OPEN_DELAY = 350;
const CLOSE_DELAY = 120;

export function HoverPreview(props: HoverPreviewProps) {
  const { children } = props;
  const anchorRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    setCanHover(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // Stale anchor on scroll/resize — just close.
  useEffect(() => {
    if (!rect) return;
    const onChange = () => setRect(null);
    window.addEventListener('scroll', onChange, true);
    window.addEventListener('resize', onChange);
    return () => {
      window.removeEventListener('scroll', onChange, true);
      window.removeEventListener('resize', onChange);
    };
  }, [rect]);

  const scheduleOpen = () => {
    if (!canHover) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => {
      if (anchorRef.current) setRect(anchorRef.current.getBoundingClientRect());
    }, OPEN_DELAY);
  };
  const scheduleClose = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setRect(null), CLOSE_DELAY);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  return (
    <div ref={anchorRef} onMouseEnter={scheduleOpen} onMouseLeave={scheduleClose}>
      {children}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {rect && (
              <PreviewPopup
                {...props}
                anchor={rect}
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

function PreviewPopup({
  anchor,
  image,
  title,
  highlight,
  meta,
  description,
  playHref,
  detailHref,
  contentType,
  contentId,
  onMouseEnter,
  onMouseLeave,
}: HoverPreviewProps & {
  anchor: DOMRect;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);

  const add = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (added || busy) return;
    setBusy(true);
    watchlistService
      .add(contentType, contentId)
      .then(() => setAdded(true))
      .catch(() => undefined)
      .finally(() => setBusy(false));
  };

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(Math.max(anchor.width * 1.5, 300), vw - 24);
  let left = anchor.left + anchor.width / 2 - width / 2;
  left = Math.max(12, Math.min(left, vw - width - 12));
  const estHeight = (width * 9) / 16 + 150;
  let top = anchor.top + anchor.height / 2 - estHeight / 2;
  top = Math.max(72, Math.min(top, vh - estHeight - 12));
  top = Math.max(12, top);

  const circle =
    'grid h-9 w-9 place-items-center rounded-full border border-white/40 bg-background/60 text-text transition hover:border-white';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ position: 'fixed', left, top, width }}
      className="z-[60] origin-center"
    >
      <div className="overflow-hidden rounded-xl bg-surface shadow-2xl ring-1 ring-white/10">
        <Link href={detailHref} className="block">
          <div className="relative aspect-video w-full bg-surface-soft">
            {image ? (
              <Image src={image} alt={title} fill sizes="480px" className="object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary/25 via-surface to-emerald/15 text-4xl font-display">
                {title.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
            <div className="absolute left-3 top-3">
              <HighlightBadge highlight={highlight} />
            </div>
          </div>
        </Link>

        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <Link
              href={playHref}
              aria-label="เล่น"
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-background transition hover:bg-white/90"
            >
              <Play className="h-4 w-4 fill-background" />
            </Link>
            <button type="button" onClick={add} aria-label="เพิ่มในรายการของฉัน" className={circle}>
              {added ? <Check className="h-4 w-4 text-emerald" /> : <Plus className="h-4 w-4" />}
            </button>
            <Link href={detailHref} aria-label="ข้อมูลเพิ่มเติม" className={`${circle} ml-auto`}>
              <ChevronDown className="h-4 w-4" />
            </Link>
          </div>

          <h3 className="font-display text-base font-semibold leading-tight">{title}</h3>
          <div className="flex items-center gap-2 text-xs text-text-muted">{meta}</div>
          {description && (
            <p className="line-clamp-2 text-xs text-text-muted">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
