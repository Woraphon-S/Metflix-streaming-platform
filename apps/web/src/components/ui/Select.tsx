'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, className, id, children, ...rest },
  ref,
) {
  const fieldId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <select
        id={fieldId}
        ref={ref}
        className={cn(
          'w-full appearance-none rounded-xl border border-white/10 bg-surface/70 px-4 py-3 text-sm text-text',
          'transition-colors focus:border-primary/70 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40',
          error && 'border-danger/70 focus:border-danger focus:ring-danger/40',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      {(hint || error) && (
        <p
          className={cn(
            'text-xs',
            error ? 'text-danger' : 'text-text-subtle',
          )}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
});
