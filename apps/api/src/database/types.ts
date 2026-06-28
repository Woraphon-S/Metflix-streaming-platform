export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type ContentHighlight =
  | 'none'
  | 'new'
  | 'top10'
  | 'new_episode'
  | 'new_season';
export type ContentGenre =
  | 'anime'
  | 'animation'
  | 'korean_drama'
  | 'drama'
  | 'horror'
  | 'comedy'
  | 'tv_show'
  | 'action'
  | 'scifi'
  | 'thriller'
  | 'romance'
  | 'general';
export type WatchlistContentType = 'movie' | 'series';
export type HistoryContentType = 'movie' | 'episode';
export type NotificationType =
  | 'movie_published'
  | 'series_published'
  | 'episode_published'
  | 'system'
  | 'admin_message'
  | 'security';

export const USER_ROLES: UserRole[] = ['user', 'admin'];
export const USER_STATUSES: UserStatus[] = ['active', 'suspended'];
export const CONTENT_STATUSES: ContentStatus[] = ['draft', 'published', 'archived'];
export const CONTENT_HIGHLIGHTS: ContentHighlight[] = [
  'none',
  'new',
  'top10',
  'new_episode',
  'new_season',
];
export const CONTENT_GENRES: ContentGenre[] = [
  'anime',
  'animation',
  'korean_drama',
  'drama',
  'horror',
  'comedy',
  'tv_show',
  'action',
  'scifi',
  'thriller',
  'romance',
  'general',
];
export const WATCHLIST_CONTENT_TYPES: WatchlistContentType[] = ['movie', 'series'];
export const HISTORY_CONTENT_TYPES: HistoryContentType[] = ['movie', 'episode'];
export const NOTIFICATION_TYPES: NotificationType[] = [
  'movie_published',
  'series_published',
  'episode_published',
  'system',
  'admin_message',
  'security',
];

export interface UserRow {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileRow {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  avatarKey: string | null;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MovieRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  videoUrl: string | null;
  durationSeconds: number;
  maturityRating: string;
  status: ContentStatus;
  highlight: ContentHighlight;
  genre: ContentGenre;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeriesRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  status: ContentStatus;
  highlight: ContentHighlight;
  genre: ContentGenre;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeriesWithCountsRow extends SeriesRow {
  seasonsCount: number;
  episodesCount: number;
}

export interface SeasonRow {
  id: string;
  seriesId: string;
  seasonNumber: number;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EpisodeRow {
  id: string;
  seriesId: string;
  seasonId: string;
  episodeNumber: number;
  title: string;
  description: string | null;
  posterUrl: string | null;
  videoUrl: string | null;
  durationSeconds: number;
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface WatchlistRow {
  id: string;
  userId: string;
  contentType: WatchlistContentType;
  contentId: string;
  createdAt: Date;
}

export interface WatchHistoryRow {
  id: string;
  userId: string;
  contentType: HistoryContentType;
  contentId: string;
  progressSeconds: number;
  durationSeconds: number;
  completedAt: Date | null;
  lastWatchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationRow {
  id: string;
  targetUserId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  payload: Record<string, unknown> | null;
  createdAt: Date;
}

export interface AdminActivityLogRow {
  id: string;
  adminId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}
