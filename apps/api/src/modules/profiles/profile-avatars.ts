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
