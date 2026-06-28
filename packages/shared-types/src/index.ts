export type UserRole = 'user' | 'admin';

export type UserStatus = 'active' | 'suspended';

export type ContentStatus = 'draft' | 'published' | 'archived';

export type ContentType = 'movie' | 'series' | 'episode';

export const CONTENT_HIGHLIGHTS = [
  'none',
  'new',
  'top10',
  'new_episode',
  'new_season',
] as const;
export type ContentHighlight = (typeof CONTENT_HIGHLIGHTS)[number];

export const CONTENT_GENRES = [
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
] as const;
export type ContentGenre = (typeof CONTENT_GENRES)[number];

export type NotificationType =
  | 'movie_published'
  | 'series_published'
  | 'episode_published'
  | 'system'
  | 'admin_message'
  | 'security';

export interface AuthUser {
  id: string;
  email: string | null;
  role: UserRole;
  displayName: string;
  avatarUrl: string | null;
}

export const PROFILE_AVATAR_KEYS = [
  'aurora',
  'ember',
  'grape',
  'ocean',
  'sunset',
  'mono',
] as const;

export type ProfileAvatarKey = (typeof PROFILE_AVATAR_KEYS)[number];

export interface Profile {
  id: string;
  displayName: string;
  avatarKey: ProfileAvatarKey | null;
  isPrimary: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MovieSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  durationSeconds: number;
  maturityRating: string;
  status: ContentStatus;
  highlight: ContentHighlight;
  genre: ContentGenre;
  viewCount: number;
  createdAt: string;
}

export interface MovieDetail extends MovieSummary {
  trailerUrl: string | null;
  videoUrl: string | null;
  updatedAt: string;
}

export interface SeriesSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  status: ContentStatus;
  highlight: ContentHighlight;
  genre: ContentGenre;
  viewCount: number;
  createdAt: string;
  seasonsCount: number;
  episodesCount: number;
}

export interface SeriesDetail extends SeriesSummary {
  trailerUrl: string | null;
  updatedAt: string;
  seasons: SeasonDetail[];
}

export interface SeasonDetail {
  id: string;
  seriesId: string;
  seasonNumber: number;
  title: string;
  description: string | null;
  episodes: EpisodeSummary[];
}

export interface EpisodeSummary {
  id: string;
  seriesId: string;
  seasonId: string;
  episodeNumber: number;
  title: string;
  description: string | null;
  posterUrl: string | null;
  durationSeconds: number;
  status: ContentStatus;
}

export interface EpisodeDetail extends EpisodeSummary {
  videoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistItem {
  id: string;
  contentType: 'movie' | 'series';
  contentId: string;
  addedAt: string;
  movie?: MovieSummary | null;
  series?: SeriesSummary | null;
}

export interface WatchHistoryItem {
  id: string;
  contentType: 'movie' | 'episode';
  contentId: string;
  progressSeconds: number;
  durationSeconds: number;
  completedAt: string | null;
  lastWatchedAt: string;
  movie?: MovieSummary | null;
  episode?: (EpisodeSummary & { seriesTitle?: string }) | null;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  payload: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalMovies: number;
  totalSeries: number;
  totalEpisodes: number;
  totalNotifications: number;
  recentMovies: MovieSummary[];
  recentSeries: SeriesSummary[];
  recentLogs: AdminActivityLogItem[];
}

export interface AdminActivityLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  adminEmail: string | null;
}
