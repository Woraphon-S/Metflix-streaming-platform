// Preset avatar keys for Netflix-style profiles. Mirrored on the web in
// apps/web/src/lib/avatars.ts (which maps each key to a gradient). Kept local
// to the API to avoid a runtime import from the source-only shared-types package.
export const PROFILE_AVATAR_KEYS = [
  'aurora',
  'ember',
  'grape',
  'ocean',
  'sunset',
  'mono',
] as const;

export type ProfileAvatarKey = (typeof PROFILE_AVATAR_KEYS)[number];

export const DEFAULT_AVATAR_KEY: ProfileAvatarKey = 'aurora';
