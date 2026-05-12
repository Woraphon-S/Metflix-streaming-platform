import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type {
  HistoryContentType,
  MovieRow,
  WatchHistoryRow,
} from '../../database/types';
import { UpdateProgressDto } from './dto/update-progress.dto';

const COMPLETION_THRESHOLD_SECONDS = 30;

const MOVIE_COLUMNS = `
  id, title, slug, description,
  poster_url AS "posterUrl",
  backdrop_url AS "backdropUrl",
  trailer_url AS "trailerUrl",
  video_url AS "videoUrl",
  duration_seconds AS "durationSeconds",
  maturity_rating AS "maturityRating",
  status, view_count AS "viewCount",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

interface EpisodeWithSeries {
  id: string;
  seriesId: string;
  seasonId: string;
  episodeNumber: number;
  title: string;
  description: string | null;
  posterUrl: string | null;
  durationSeconds: number;
  status: 'draft' | 'published' | 'archived';
  seriesTitle: string;
  seasonNumber: number;
}

export interface ContinueWatchingItem {
  id: string;
  contentType: HistoryContentType;
  contentId: string;
  progressSeconds: number;
  durationSeconds: number;
  completedAt: Date | null;
  lastWatchedAt: Date;
  movie: MovieRow | null;
  episode: EpisodeWithSeries | null;
}

@Injectable()
export class WatchHistoryService {
  constructor(private readonly db: DatabaseService) {}

  async getContinueWatching(userId: string, limit = 12): Promise<ContinueWatchingItem[]> {
    const items = await this.db.query<WatchHistoryRow>(
      `SELECT id,
              user_id AS "userId",
              content_type AS "contentType",
              content_id AS "contentId",
              progress_seconds AS "progressSeconds",
              duration_seconds AS "durationSeconds",
              completed_at AS "completedAt",
              last_watched_at AS "lastWatchedAt",
              created_at AS "createdAt",
              updated_at AS "updatedAt"
       FROM watch_histories
       WHERE user_id = $1 AND completed_at IS NULL AND progress_seconds > 0
       ORDER BY last_watched_at DESC
       LIMIT $2`,
      [userId, limit],
    );

    const movieIds = items.filter((i) => i.contentType === 'movie').map((i) => i.contentId);
    const episodeIds = items.filter((i) => i.contentType === 'episode').map((i) => i.contentId);

    const [movies, episodes] = await Promise.all([
      movieIds.length
        ? this.db.query<MovieRow>(
            `SELECT ${MOVIE_COLUMNS} FROM movies WHERE id = ANY($1)`,
            [movieIds],
          )
        : Promise.resolve<MovieRow[]>([]),
      episodeIds.length
        ? this.db.query<EpisodeWithSeries>(
            `SELECT e.id,
                    e.series_id AS "seriesId",
                    e.season_id AS "seasonId",
                    e.episode_number AS "episodeNumber",
                    e.title,
                    e.description,
                    e.poster_url AS "posterUrl",
                    e.duration_seconds AS "durationSeconds",
                    e.status,
                    sr.title AS "seriesTitle",
                    s.season_number AS "seasonNumber"
             FROM episodes e
             JOIN series sr ON sr.id = e.series_id
             JOIN seasons s ON s.id = e.season_id
             WHERE e.id = ANY($1)`,
            [episodeIds],
          )
        : Promise.resolve<EpisodeWithSeries[]>([]),
    ]);

    const movieMap = new Map(movies.map((m) => [m.id, m]));
    const episodeMap = new Map(episodes.map((e) => [e.id, e]));

    return items.map((item) => ({
      id: item.id,
      contentType: item.contentType,
      contentId: item.contentId,
      progressSeconds: item.progressSeconds,
      durationSeconds: item.durationSeconds,
      completedAt: item.completedAt,
      lastWatchedAt: item.lastWatchedAt,
      movie: item.contentType === 'movie' ? movieMap.get(item.contentId) ?? null : null,
      episode: item.contentType === 'episode' ? episodeMap.get(item.contentId) ?? null : null,
    }));
  }

  async getOne(
    userId: string,
    contentType: HistoryContentType,
    contentId: string,
  ): Promise<WatchHistoryRow | null> {
    return this.db.queryOne<WatchHistoryRow>(
      `SELECT id,
              user_id AS "userId",
              content_type AS "contentType",
              content_id AS "contentId",
              progress_seconds AS "progressSeconds",
              duration_seconds AS "durationSeconds",
              completed_at AS "completedAt",
              last_watched_at AS "lastWatchedAt",
              created_at AS "createdAt",
              updated_at AS "updatedAt"
       FROM watch_histories
       WHERE user_id = $1 AND content_type = $2 AND content_id = $3`,
      [userId, contentType, contentId],
    );
  }

  async updateProgress(userId: string, dto: UpdateProgressDto): Promise<WatchHistoryRow> {
    await this.assertContentExists(dto.contentType, dto.contentId);

    const isCompleted =
      dto.durationSeconds > 0 &&
      dto.progressSeconds >= dto.durationSeconds - COMPLETION_THRESHOLD_SECONDS;
    const completedAt = isCompleted ? new Date() : null;

    const row = await this.db.queryOne<WatchHistoryRow>(
      `INSERT INTO watch_histories
         (user_id, content_type, content_id, progress_seconds, duration_seconds,
          last_watched_at, completed_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6)
       ON CONFLICT (user_id, content_type, content_id) DO UPDATE SET
         progress_seconds = EXCLUDED.progress_seconds,
         duration_seconds = EXCLUDED.duration_seconds,
         last_watched_at = NOW(),
         completed_at = EXCLUDED.completed_at
       RETURNING id,
                 user_id AS "userId",
                 content_type AS "contentType",
                 content_id AS "contentId",
                 progress_seconds AS "progressSeconds",
                 duration_seconds AS "durationSeconds",
                 completed_at AS "completedAt",
                 last_watched_at AS "lastWatchedAt",
                 created_at AS "createdAt",
                 updated_at AS "updatedAt"`,
      [
        userId,
        dto.contentType,
        dto.contentId,
        dto.progressSeconds,
        dto.durationSeconds,
        completedAt,
      ],
    );
    if (!row) throw new Error('Failed to update watch progress');
    return row;
  }

  private async assertContentExists(
    contentType: HistoryContentType,
    contentId: string,
  ): Promise<void> {
    const table = contentType === 'movie' ? 'movies' : 'episodes';
    const exists = await this.db.queryOne<{ id: string }>(
      `SELECT id FROM ${table} WHERE id = $1`,
      [contentId],
    );
    if (!exists) {
      throw new NotFoundException(
        contentType === 'movie' ? 'Movie not found' : 'Episode not found',
      );
    }
  }
}
