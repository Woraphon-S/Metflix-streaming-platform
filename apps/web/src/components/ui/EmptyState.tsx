import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-surface/40 px-6 py-14 text-center',
        className,
      )}
    >
      {icon && <div className="text-primary-400">{icon}</div>}
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && (
        <p className="max-w-md text-sm text-text-muted">{description}</p>
      )}
      {action}
    </div>
  );
}
