import { avatarGradient } from '@/lib/avatars';
import { cn } from '@/lib/cn';

// Avatar gradients are applied from data, so the class names never appear as
// literals in a scanned file. Listing them here (a scanned component) lets the
// Tailwind JIT emit them without a dev-server restart:
// from-emerald to-primary from-orange-500 to-red-500 from-violet-500 to-fuchsia-600
// from-sky-500 to-indigo-600 from-rose-500 to-orange-400 from-slate-500 to-slate-700

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<Size, string> = {
  sm: 'h-8 w-8 rounded-lg text-sm',
  md: 'h-10 w-10 rounded-lg text-base',
  lg: 'h-24 w-24 rounded-2xl text-3xl',
  xl: 'h-28 w-28 rounded-2xl text-4xl sm:h-32 sm:w-32',
};

interface ProfileAvatarProps {
  displayName: string;
  avatarKey?: string | null;
  size?: Size;
  className?: string;
}

export function ProfileAvatar({
  displayName,
  avatarKey,
  size = 'md',
  className,
}: ProfileAvatarProps) {
  return (
    <span
      className={cn(
        'grid place-items-center bg-gradient-to-br font-bold text-background select-none',
        avatarGradient(avatarKey),
        SIZES[size],
        className,
      )}
    >
      {displayName.slice(0, 1).toUpperCase()}
    </span>
  );
}
