import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { ProfilesService } from '../profiles/profiles.service';
import type {
  MovieRow,
  SeriesWithCountsRow,
  WatchlistContentType,
  WatchlistRow,
} from '../../database/types';

const MOVIE_COLUMNS = `
  id, title, slug, description,
  poster_url AS "posterUrl",
  backdrop_url AS "backdropUrl",
  trailer_url AS "trailerUrl",
  video_url AS "videoUrl",
  duration_seconds AS "durationSeconds",
  maturity_rating AS "maturityRating",
  status, highlight, genre, view_count AS "viewCount",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const SERIES_COLUMNS = `
  id, title, slug, description,
  poster_url AS "posterUrl",
  backdrop_url AS "backdropUrl",
  trailer_url AS "trailerUrl",
  status, highlight, genre, view_count AS "viewCount",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export interface WatchlistListItem {
  id: string;
  contentType: WatchlistContentType;
  contentId: string;
  addedAt: Date;
  movie: MovieRow | null;
  series: SeriesWithCountsRow | null;
}

@Injectable()
export class WatchlistService {
  constructor(
    private readonly db: DatabaseService,
    private readonly profiles: ProfilesService,
  ) {}

  async list(userId: string, profileId: string): Promise<WatchlistListItem[]> {
    await this.profiles.assertOwnership(userId, profileId);

    const items = await this.db.query<WatchlistRow>(
      `SELECT id,
              user_id AS "userId",
              content_type AS "contentType",
              content_id AS "contentId",
              created_at AS "createdAt"
       FROM watchlists
       WHERE profile_id = $1
       ORDER BY created_at DESC`,
      [profileId],
    );

    const movieIds = items.filter((i) => i.contentType === 'movie').map((i) => i.contentId);
    const seriesIds = items.filter((i) => i.contentType === 'series').map((i) => i.contentId);

    const [movies, series] = await Promise.all([
      movieIds.length
        ? this.db.query<MovieRow>(
            `SELECT ${MOVIE_COLUMNS} FROM movies WHERE id = ANY($1)`,
            [movieIds],
          )
        : Promise.resolve<MovieRow[]>([]),
      seriesIds.length
        ? this.db.query<SeriesWithCountsRow>(
            `SELECT ${SERIES_COLUMNS},
                    (SELECT COUNT(*) FROM seasons WHERE series_id = s.id)::int AS "seasonsCount",
                    (SELECT COUNT(*) FROM episodes WHERE series_id = s.id)::int AS "episodesCount"
             FROM series s WHERE id = ANY($1)`,
            [seriesIds],
          )
        : Promise.resolve<SeriesWithCountsRow[]>([]),
    ]);

    const movieMap = new Map(movies.map((m) => [m.id, m]));
    const seriesMap = new Map(series.map((s) => [s.id, s]));

    return items.map((item) => ({
      id: item.id,
      contentType: item.contentType,
      contentId: item.contentId,
      addedAt: item.createdAt,
      movie: item.contentType === 'movie' ? movieMap.get(item.contentId) ?? null : null,
      series: item.contentType === 'series' ? seriesMap.get(item.contentId) ?? null : null,
    }));
  }

  async add(
    userId: string,
    profileId: string,
    contentType: WatchlistContentType,
    contentId: string,
  ): Promise<WatchlistRow> {
    await this.profiles.assertOwnership(userId, profileId);
    await this.assertContentExists(contentType, contentId);

    const existing = await this.db.queryOne<WatchlistRow>(
      `SELECT id, user_id AS "userId", content_type AS "contentType",
              content_id AS "contentId", created_at AS "createdAt"
       FROM watchlists
       WHERE profile_id = $1 AND content_type = $2 AND content_id = $3`,
      [profileId, contentType, contentId],
    );
    if (existing) return existing;

    const inserted = await this.db.queryOne<WatchlistRow>(
      `INSERT INTO watchlists (user_id, profile_id, content_type, content_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id AS "userId", content_type AS "contentType",
                 content_id AS "contentId", created_at AS "createdAt"`,
      [userId, profileId, contentType, contentId],
    );
    if (!inserted) throw new Error('Failed to add to watchlist');
    return inserted;
  }

  async remove(
    userId: string,
    profileId: string,
    contentType: WatchlistContentType,
    contentId: string,
  ): Promise<{ ok: true }> {
    await this.profiles.assertOwnership(userId, profileId);
    await this.db.execute(
      'DELETE FROM watchlists WHERE profile_id = $1 AND content_type = $2 AND content_id = $3',
      [profileId, contentType, contentId],
    );
    return { ok: true };
  }

  async exists(
    userId: string,
    profileId: string,
    contentType: WatchlistContentType,
    contentId: string,
  ): Promise<{ inWatchlist: boolean }> {
    await this.profiles.assertOwnership(userId, profileId);
    const row = await this.db.queryOne<{ id: string }>(
      'SELECT id FROM watchlists WHERE profile_id = $1 AND content_type = $2 AND content_id = $3',
      [profileId, contentType, contentId],
    );
    return { inWatchlist: !!row };
  }

  private async assertContentExists(
    contentType: WatchlistContentType,
    contentId: string,
  ): Promise<void> {
    const table = contentType === 'movie' ? 'movies' : 'series';
    const row = await this.db.queryOne<{ id: string }>(
      `SELECT id FROM ${table} WHERE id = $1`,
      [contentId],
    );
    if (!row) {
      throw new NotFoundException(
        contentType === 'movie' ? 'Movie not found' : 'Series not found',
      );
    }
  }
}
