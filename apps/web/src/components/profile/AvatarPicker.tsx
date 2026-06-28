'use client';

import { AVATAR_KEYS } from '@/lib/avatars';
import { ProfileAvatar } from './ProfileAvatar';
import { cn } from '@/lib/cn';

interface AvatarPickerProps {
  value?: string | null;
  displayName: string;
  onChange: (key: string) => void;
}

export function AvatarPicker({ value, displayName, onChange }: AvatarPickerProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {AVATAR_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          aria-label={key}
          onClick={() => onChange(key)}
          className={cn(
            'rounded-xl p-0.5 ring-2 transition',
            value === key ? 'ring-emerald' : 'ring-transparent hover:ring-white/40',
          )}
        >
          <ProfileAvatar
            displayName={displayName || 'A'}
            avatarKey={key}
            size="md"
          />
        </button>
      ))}
    </div>
  );
}
