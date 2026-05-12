'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leading, className, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        {leading && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle">
            {leading}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full rounded-xl border border-white/10 bg-surface/70 px-4 py-3 text-sm text-text placeholder:text-text-subtle',
            'transition-colors focus:border-primary/70 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40',
            leading && 'pl-10',
            error && 'border-danger/70 focus:border-danger focus:ring-danger/40',
            className,
          )}
          {...rest}
        />
      </div>
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
