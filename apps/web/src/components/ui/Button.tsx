'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'emerald' | 'ghost' | 'outline' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leading?: ReactNode;
  trailing?: ReactNode;
  loading?: boolean;
}

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-primary hover:bg-primary-400 text-white shadow-glow hover:shadow-[0_0_50px_rgba(14,165,233,0.7)] active:scale-[0.98]',
  emerald:
    'bg-emerald text-background hover:brightness-110 shadow-glowEmerald font-semibold active:scale-[0.98]',
  ghost: 'bg-white/5 hover:bg-white/10 text-text border border-transparent',
  outline:
    'bg-transparent border border-primary/50 hover:bg-primary/10 text-text',
  danger: 'bg-danger/90 hover:bg-danger text-white',
  subtle:
    'bg-surface-soft text-text hover:bg-surface/80 border border-white/5',
};

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10 p-0',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    leading,
    trailing,
    loading = false,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
        'focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : (
        leading
      )}
      <span>{children}</span>
      {!loading && trailing}
    </button>
  );
});
