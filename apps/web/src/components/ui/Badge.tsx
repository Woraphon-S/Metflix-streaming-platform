import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'primary' | 'emerald' | 'warning' | 'danger';

const TONE: Record<Tone, string> = {
  neutral: 'bg-white/8 text-text-muted border border-white/10',
  primary: 'bg-primary/15 text-primary-400 border border-primary/30',
  emerald: 'bg-emerald/15 text-emerald border border-emerald/30',
  warning: 'bg-warning/15 text-warning border border-warning/30',
  danger: 'bg-danger/15 text-danger border border-danger/30',
};

interface BadgeProps {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide',
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
