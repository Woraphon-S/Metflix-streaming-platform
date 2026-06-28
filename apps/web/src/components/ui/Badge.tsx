import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'primary' | 'emerald' | 'success' | 'warning' | 'danger';

const TONE: Record<Tone, string> = {
  neutral: 'bg-surface-soft text-text-muted',
  primary: 'bg-primary text-white',
  emerald: 'bg-emerald text-background',
  success: 'bg-success text-background',
  warning: 'bg-warning text-background',
  danger: 'bg-danger text-white',
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
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
