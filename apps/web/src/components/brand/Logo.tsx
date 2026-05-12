import Link from 'next/link';
import { cn } from '@/lib/cn';

export function Logo({
  className,
  size = 'md',
  asLink = true,
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
}) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  } as const;

  const content = (
    <span
      className={cn(
        'font-display font-extrabold tracking-tight',
        sizes[size],
        className,
      )}
    >
      <span className="bg-gradient-to-r from-primary via-primary-400 to-emerald bg-clip-text text-transparent">
        MET
      </span>
      <span className="text-text">FLIX</span>
    </span>
  );

  return asLink ? <Link href="/browse">{content}</Link> : content;
}
