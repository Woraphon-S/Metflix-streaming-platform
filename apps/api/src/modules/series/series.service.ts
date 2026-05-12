import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type {
  EpisodeRow,
  SeasonRow,
  SeriesRow,
  SeriesWithCountsRow,
} from '../../database/types';
import { paginate } from '../../common/dto/pagination-query.dto';
import { ensureUniqueSlug } from '../../common/utils/slug';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { AdminLogService } from '../admin/admin-log.service';

const SERIES_COLUMNS = `
  id,
  title,
  slug,
  description,
  poster_url AS "posterUrl",
  backdrop_url AS "backdropUrl",
  trailer_url AS "trailerUrl",
  status,
  view_count AS "viewCount",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

interface SeasonWithEpisodes extends SeasonRow {
  episodes: EpisodeRow[];
}

export type SeriesDetailResult = SeriesRow & {
  seasons: SeasonWithEpisodes[];
};

@Injectable()
export class SeriesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly notifications: NotificationsService,
    private readonly adminLog: AdminLogService,
  ) {}

  async listPublic(page: number, pageSize: number, search?: string) {
    const params: unknown[] = [];
    let where = `s.status = 'published'`;
    if (search) {
      params.push(`%${search}%`);
      where += ` AND s.title ILIKE $${params.length}`;
    }
    const limitPos = params.push(pageSize);
    const offsetPos = params.push((page - 1) * pageSize);

    const items = await this.db.query<SeriesWithCountsRow>(
      `SELECT s.*,
              (SELECT COUNT(*) FROM seasons WHERE series_id = s.id)::int AS "seasonsCount",
              (SELECT COUNT(*) FROM episodes WHERE series_id = s.id)::int AS "episodesCount"
       FROM (
         SELECT ${SERIES_COLUMNS}
         FROM series s
         WHERE ${where}
         ORDER BY created_at DESC
         LIMIT $${limitPos} OFFSET $${offsetPos}
       ) AS s`,
      params,
    );

    const countRow = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM series s WHERE ${where}`,
      params.slice(0, params.length - 2),
    );
    return paginate(items, Number(countRow?.count ?? 0), page, pageSize);
  }

  async listAll(page: number, pageSize: number, search?: string) {
    const params: unknown[] = [];
    let where = 'TRUE';
    if (search) {
      params.push(`%${search}%`);
      where = `s.title ILIKE $${params.length}`;
    }
    const limitPos = params.push(pageSize);
    const offsetPos = params.push((page - 1) * pageSize);

    const items = await this.db.query<SeriesWithCountsRow>(
      `SELECT s.*,
              (SELECT COUNT(*) FROM seasons WHERE series_id = s.id)::int AS "seasonsCount",
              (SELECT COUNT(*) FROM episodes WHERE series_id = s.id)::int AS "episodesCount"
       FROM (
         SELECT ${SERIES_COLUMNS}
         FROM series s
         WHERE ${where}
         ORDER BY updated_at DESC
         LIMIT $${limitPos} OFFSET $${offsetPos}
       ) AS s`,
      params,
    );

    const countRow = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM series s WHERE ${where}`,
      params.slice(0, params.length - 2),
    );
    return paginate(items, Number(countRow?.count ?? 0), page, pageSize);
  }

  async getPublic(id: string): Promise<SeriesDetailResult> {
    const series = await this.db.queryOne<SeriesRow>(
      `SELECT ${SERIES_COLUMNS} FROM series WHERE id = $1 AND status = 'published'`,
      [id],
    );
    if (!series) throw new NotFoundException('Series not found');
    const seasons = await this.fetchSeasonsWithEpisodes(id, true);
    return { ...series, seasons };
  }

  async getAny(id: string): Promise<SeriesDetailResult> {
    const series = await this.db.queryOne<SeriesRow>(
      `SELECT ${SERIES_COLUMNS} FROM series WHERE id = $1`,
      [id],
    );
    if (!series) throw new NotFoundException('Series not found');
    const seasons = await this.fetchSeasonsWithEpisodes(id, false);
    return { ...series, seasons };
  }

  async create(adminId: string, dto: CreateSeriesDto): Promise<SeriesRow> {
    const slug = await ensureUniqueSlug(
      dto.slug ?? dto.title,
      async (candidate) => {
        const row = await this.db.queryOne<{ count: string }>(
          'SELECT COUNT(*) AS count FROM series WHERE slug = $1',
          [candidate],
        );
        return Number(row?.count ?? 0) > 0;
      },
    );

    const series = await this.db.queryOne<SeriesRow>(
      `INSERT INTO series
         (title, slug, description, poster_url, backdrop_url, trailer_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${SERIES_COLUMNS}`,
      [
        dto.title,
        slug,
        dto.description ?? '',
        dto.posterUrl ?? null,
        dto.backdropUrl ?? null,
        dto.trailerUrl ?? null,
        dto.status ?? 'draft',
      ],
    );
    if (!series) throw new Error('Failed to create series');

    await this.adminLog.record({
      adminId,
      action: 'series.create',
      entityType: 'series',
      entityId: series.id,
      metadata: { title: series.title, status: series.status },
    });

    if (series.status === 'published') {
      await this.notifications.broadcast({
        type: 'series_published',
        title: 'New series available',
        message: `${series.title} is now streaming on METFLIX.`,
        payload: { seriesId: series.id, slug: series.slug },
      });
    }

    return series;
  }

  async update(adminId: string, id: string, dto: UpdateSeriesDto): Promise<SeriesRow> {
    const existing = await this.db.queryOne<SeriesRow>(
      `SELECT ${SERIES_COLUMNS} FROM series WHERE id = $1`,
      [id],
    );
    if (!existing) throw new NotFoundException('Series not found');

    const slug =
      dto.slug && dto.slug !== existing.slug
        ? await ensureUniqueSlug(dto.slug, async (candidate) => {
            const row = await this.db.queryOne<{ count: string }>(
              'SELECT COUNT(*) AS count FROM series WHERE slug = $1 AND id <> $2',
              [candidate, id],
            );
            return Number(row?.count ?? 0) > 0;
          })
        : existing.slug;

    const series = await this.db.queryOne<SeriesRow>(
      `UPDATE series SET
         title = COALESCE($2, title),
         slug = $3,
         description = COALESCE($4, description),
         poster_url = COALESCE($5, poster_url),
         backdrop_url = COALESCE($6, backdrop_url),
         trailer_url = COALESCE($7, trailer_url),
         status = COALESCE($8, status)
       WHERE id = $1
       RETURNING ${SERIES_COLUMNS}`,
      [
        id,
        dto.title ?? null,
        slug,
        dto.description ?? null,
        dto.posterUrl ?? null,
        dto.backdropUrl ?? null,
        dto.trailerUrl ?? null,
        dto.status ?? null,
      ],
    );
    if (!series) throw new NotFoundException('Series not found');

    await this.adminLog.record({
      adminId,
      action: 'series.update',
      entityType: 'series',
      entityId: series.id,
      metadata: { title: series.title, status: series.status },
    });

    if (existing.status !== 'published' && series.status === 'published') {
      await this.notifications.broadcast({
        type: 'series_published',
        title: 'Series now available',
        message: `${series.title} has just been published.`,
        payload: { seriesId: series.id, slug: series.slug },
      });
    }
    return series;
  }

  async remove(adminId: string, id: string): Promise<{ ok: true }> {
    const existing = await this.db.queryOne<{ title: string }>(
      'SELECT title FROM series WHERE id = $1',
      [id],
    );
    if (!existing) throw new NotFoundException('Series not found');
    await this.db.execute('DELETE FROM series WHERE id = $1', [id]);
    await this.adminLog.record({
      adminId,
      action: 'series.delete',
      entityType: 'series',
      entityId: id,
      metadata: { title: existing.title },
    });
    return { ok: true };
  }

  async incrementView(id: string): Promise<void> {
    await this.db.execute(
      'UPDATE series SET view_count = view_count + 1 WHERE id = $1',
      [id],
    );
  }

  private async fetchSeasonsWithEpisodes(
    seriesId: string,
    publishedEpisodesOnly: boolean,
  ): Promise<SeasonWithEpisodes[]> {
    const seasons = await this.db.query<SeasonRow>(
      `SELECT
         id,
         series_id AS "seriesId",
         season_number AS "seasonNumber",
         title,
         description,
         created_at AS "createdAt",
         updated_at AS "updatedAt"
       FROM seasons
       WHERE series_id = $1
       ORDER BY season_number ASC`,
      [seriesId],
    );
    if (seasons.length === 0) return [];

    const seasonIds = seasons.map((s) => s.id);
    const episodeStatusFilter = publishedEpisodesOnly ? `AND status = 'published'` : '';

    const episodes = await this.db.query<EpisodeRow>(
      `SELECT
         id,
         series_id AS "seriesId",
         season_id AS "seasonId",
         episode_number AS "episodeNumber",
         title,
         description,
         poster_url AS "posterUrl",
         video_url AS "videoUrl",
         duration_seconds AS "durationSeconds",
         status,
         created_at AS "createdAt",
         updated_at AS "updatedAt"
       FROM episodes
       WHERE season_id = ANY($1) ${episodeStatusFilter}
       ORDER BY episode_number ASC`,
      [seasonIds],
    );

    const byseason = new Map<string, EpisodeRow[]>();
    for (const ep of episodes) {
      const list = byseason.get(ep.seasonId) ?? [];
      list.push(ep);
      byseason.set(ep.seasonId, list);
    }

    return seasons.map((s) => ({ ...s, episodes: byseason.get(s.id) ?? [] }));
  }
}
