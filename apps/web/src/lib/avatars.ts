import type { ProfileAvatarKey } from '@metflix/shared-types';

// Preset avatar gradients for Netflix-style profiles. The keys mirror the API's
// apps/api/src/modules/profiles/profile-avatars.ts. Full literal class strings
// so Tailwind's JIT can detect them (src/lib is in the content globs).
export const AVATARS: Record<ProfileAvatarKey, { label: string; gradient: string }> = {
  aurora: { label: 'Aurora', gradient: 'from-emerald to-primary' },
  ember: { label: 'Ember', gradient: 'from-orange-500 to-red-500' },
  grape: { label: 'Grape', gradient: 'from-violet-500 to-fuchsia-600' },
  ocean: { label: 'Ocean', gradient: 'from-sky-500 to-indigo-600' },
  sunset: { label: 'Sunset', gradient: 'from-rose-500 to-orange-400' },
  mono: { label: 'Mono', gradient: 'from-slate-500 to-slate-700' },
};

export const DEFAULT_AVATAR_KEY: ProfileAvatarKey = 'aurora';

export const AVATAR_KEYS = Object.keys(AVATARS) as ProfileAvatarKey[];

export const avatarGradient = (key?: string | null): string =>
  (key && key in AVATARS
    ? AVATARS[key as ProfileAvatarKey]
    : AVATARS[DEFAULT_AVATAR_KEY]
  ).gradient;
