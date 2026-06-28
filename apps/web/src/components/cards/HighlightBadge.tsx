import { cn } from '@/lib/cn';
import type { ContentHighlight } from '@metflix/shared-types';

const LABELS: Record<string, string> = {
  new: 'เพิ่มใหม่ล่าสุด',
  top10: 'TOP 10',
  new_episode: 'ตอนใหม่',
  new_season: 'ซีซั่นใหม่',
};

export function HighlightBadge({
  highlight,
  className,
}: {
  highlight?: ContentHighlight | null;
  className?: string;
}) {
  // Guard against 'none', null/undefined, or any unmapped value (e.g. stale
  // cached data from before the field existed) so we never render an empty badge.
  const label = highlight ? LABELS[highlight] : undefined;
  if (!label) return null;

  return (
    <span
      className={cn(
        'inline-block rounded-[3px] bg-[#e50914] px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-white shadow',
        className,
      )}
    >
      {label}
    </span>
  );
}
