import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { MovieRow } from '../../database/types';
import { paginate } from '../../common/dto/pagination-query.dto';
import { ensureUniqueSlug } from '../../common/utils/slug';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { AdminLogService } from '../admin/admin-log.service';

const MOVIE_COLUMNS = `
  id,
  title,
  slug,
  description,
  poster_url AS "posterUrl",
  backdrop_url AS "backdropUrl",
  trailer_url AS "trailerUrl",
  video_url AS "videoUrl",
  duration_seconds AS "durationSeconds",
  maturity_rating AS "maturityRating",
  status,
  highlight,
  genre,
  view_count AS "viewCount",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

@Injectable()
export class MoviesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly notifications: NotificationsService,
    private readonly adminLog: AdminLogService,
  ) {}

  async listPublic(page: number, pageSize: number, search?: string) {
    const params: unknown[] = [];
    let where = `status = 'published'`;
    if (search) {
      params.push(`%${search}%`);
      where += ` AND title ILIKE $${params.length}`;
    }
    const limitPos = params.push(pageSize);
    const offsetPos = params.push((page - 1) * pageSize);

    const items = await this.db.query<MovieRow>(
      `SELECT ${MOVIE_COLUMNS}
       FROM movies
       WHERE ${where}
       ORDER BY created_at DESC
       LIMIT $${limitPos} OFFSET $${offsetPos}`,
      params,
    );

    const countRow = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM movies WHERE ${where}`,
      params.slice(0, params.length - 2),
    );
    return paginate(items, Number(countRow?.count ?? 0), page, pageSize);
  }

  async listAll(page: number, pageSize: number, search?: string) {
    const params: unknown[] = [];
    let where = 'TRUE';
    if (search) {
      params.push(`%${search}%`);
      where = `title ILIKE $${params.length}`;
    }
    const limitPos = params.push(pageSize);
    const offsetPos = params.push((page - 1) * pageSize);

    const items = await this.db.query<MovieRow>(
      `SELECT ${MOVIE_COLUMNS}
       FROM movies
       WHERE ${where}
       ORDER BY updated_at DESC
       LIMIT $${limitPos} OFFSET $${offsetPos}`,
      params,
    );

    const countRow = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM movies WHERE ${where}`,
      params.slice(0, params.length - 2),
    );
    return paginate(items, Number(countRow?.count ?? 0), page, pageSize);
  }

  async getPublic(id: string): Promise<MovieRow> {
    const movie = await this.db.queryOne<MovieRow>(
      `SELECT ${MOVIE_COLUMNS} FROM movies WHERE id = $1 AND status = 'published'`,
      [id],
    );
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }

  async getAny(id: string): Promise<MovieRow> {
    const movie = await this.db.queryOne<MovieRow>(
      `SELECT ${MOVIE_COLUMNS} FROM movies WHERE id = $1`,
      [id],
    );
    if (!movie) throw new NotFoundException('Movie not found');
    return movie;
  }

  async incrementView(id: string): Promise<void> {
    await this.db.execute(
      'UPDATE movies SET view_count = view_count + 1 WHERE id = $1',
      [id],
    );
  }

  async create(adminId: string, dto: CreateMovieDto): Promise<MovieRow> {
    const slug = await ensureUniqueSlug(
      dto.slug ?? dto.title,
      async (candidate) => {
        const row = await this.db.queryOne<{ count: string }>(
          'SELECT COUNT(*) AS count FROM movies WHERE slug = $1',
          [candidate],
        );
        return Number(row?.count ?? 0) > 0;
      },
    );

    const movie = await this.db.queryOne<MovieRow>(
      `INSERT INTO movies
        (title, slug, description, poster_url, backdrop_url, trailer_url, video_url,
         duration_seconds, maturity_rating, status, highlight, genre)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING ${MOVIE_COLUMNS}`,
      [
        dto.title,
        slug,
        dto.description ?? '',
        dto.posterUrl ?? null,
        dto.backdropUrl ?? null,
        dto.trailerUrl ?? null,
        dto.videoUrl ?? null,
        dto.durationSeconds ?? 0,
        dto.maturityRating ?? 'PG-13',
        dto.status ?? 'draft',
        dto.highlight ?? 'none',
        dto.genre ?? 'general',
      ],
    );
    if (!movie) throw new Error('Failed to create movie');

    await this.adminLog.record({
      adminId,
      action: 'movie.create',
      entityType: 'movie',
      entityId: movie.id,
      metadata: { title: movie.title, status: movie.status },
    });

    if (movie.status === 'published') {
      await this.notifications.broadcast({
        type: 'movie_published',
        title: 'New movie just dropped',
        message: `${movie.title} is now streaming on METFLIX.`,
        payload: { movieId: movie.id, slug: movie.slug },
      });
    }

    return movie;
  }

  async update(adminId: string, id: string, dto: UpdateMovieDto): Promise<MovieRow> {
    const existing = await this.getAny(id);
    const slug =
      dto.slug && dto.slug !== existing.slug
        ? await ensureUniqueSlug(dto.slug, async (candidate) => {
            const row = await this.db.queryOne<{ count: string }>(
              'SELECT COUNT(*) AS count FROM movies WHERE slug = $1 AND id <> $2',
              [candidate, id],
            );
            return Number(row?.count ?? 0) > 0;
          })
        : existing.slug;

    const movie = await this.db.queryOne<MovieRow>(
      `UPDATE movies SET
         title = COALESCE($2, title),
         slug = $3,
         description = COALESCE($4, description),
         poster_url = COALESCE($5, poster_url),
         backdrop_url = COALESCE($6, backdrop_url),
         trailer_url = COALESCE($7, trailer_url),
         video_url = COALESCE($8, video_url),
         duration_seconds = COALESCE($9, duration_seconds),
         maturity_rating = COALESCE($10, maturity_rating),
         status = COALESCE($11, status),
         highlight = COALESCE($12, highlight),
         genre = COALESCE($13, genre)
       WHERE id = $1
       RETURNING ${MOVIE_COLUMNS}`,
      [
        id,
        dto.title ?? null,
        slug,
        dto.description ?? null,
        dto.posterUrl ?? null,
        dto.backdropUrl ?? null,
        dto.trailerUrl ?? null,
        dto.videoUrl ?? null,
        dto.durationSeconds ?? null,
        dto.maturityRating ?? null,
        dto.status ?? null,
        dto.highlight ?? null,
        dto.genre ?? null,
      ],
    );
    if (!movie) throw new NotFoundException('Movie not found');

    await this.adminLog.record({
      adminId,
      action: 'movie.update',
      entityType: 'movie',
      entityId: movie.id,
      metadata: { title: movie.title, status: movie.status },
    });

    if (existing.status !== 'published' && movie.status === 'published') {
      await this.notifications.broadcast({
        type: 'movie_published',
        title: 'Movie now available',
        message: `${movie.title} has just been published.`,
        payload: { movieId: movie.id, slug: movie.slug },
      });
    }

    return movie;
  }

  async remove(adminId: string, id: string): Promise<{ ok: true }> {
    const existing = await this.getAny(id);
    await this.db.execute('DELETE FROM movies WHERE id = $1', [id]);
    await this.adminLog.record({
      adminId,
      action: 'movie.delete',
      entityType: 'movie',
      entityId: id,
      metadata: { title: existing.title },
    });
    return { ok: true };
  }
}
