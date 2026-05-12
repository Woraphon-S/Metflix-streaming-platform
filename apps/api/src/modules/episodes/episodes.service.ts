import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { EpisodeRow } from '../../database/types';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { AdminLogService } from '../admin/admin-log.service';

const EPISODE_COLUMNS = `
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
`;

interface EpisodeWithRelations extends EpisodeRow {
  series: { id: string; title: string } | null;
  season: { id: string; seasonNumber: number } | null;
}

@Injectable()
export class EpisodesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly notifications: NotificationsService,
    private readonly adminLog: AdminLogService,
  ) {}

  async getPublic(id: string): Promise<EpisodeWithRelations> {
    return this.fetchById(id, true);
  }

  async getAny(id: string): Promise<EpisodeWithRelations> {
    return this.fetchById(id, false);
  }

  async getNextEpisode(currentId: string): Promise<EpisodeRow | null> {
    const current = await this.db.queryOne<{
      seasonId: string;
      seriesId: string;
      episodeNumber: number;
      seasonNumber: number;
    }>(
      `SELECT e.season_id AS "seasonId",
              e.series_id AS "seriesId",
              e.episode_number AS "episodeNumber",
              s.season_number AS "seasonNumber"
       FROM episodes e
       JOIN seasons s ON s.id = e.season_id
       WHERE e.id = $1`,
      [currentId],
    );
    if (!current) throw new NotFoundException('Episode not found');

    const nextInSeason = await this.db.queryOne<EpisodeRow>(
      `SELECT ${EPISODE_COLUMNS}
       FROM episodes
       WHERE season_id = $1
         AND episode_number > $2
         AND status = 'published'
       ORDER BY episode_number ASC
       LIMIT 1`,
      [current.seasonId, current.episodeNumber],
    );
    if (nextInSeason) return nextInSeason;

    return this.db.queryOne<EpisodeRow>(
      `SELECT ${EPISODE_COLUMNS}
       FROM episodes
       WHERE series_id = $1
         AND season_id IN (
           SELECT id FROM seasons WHERE series_id = $1 AND season_number > $2
           ORDER BY season_number ASC
           LIMIT 1
         )
         AND status = 'published'
       ORDER BY episode_number ASC
       LIMIT 1`,
      [current.seriesId, current.seasonNumber],
    );
  }

  async create(adminId: string, dto: CreateEpisodeDto): Promise<EpisodeRow> {
    const season = await this.db.queryOne<{
      id: string;
      seriesId: string;
      seasonNumber: number;
      seriesTitle: string;
    }>(
      `SELECT s.id,
              s.series_id AS "seriesId",
              s.season_number AS "seasonNumber",
              sr.title AS "seriesTitle"
       FROM seasons s
       JOIN series sr ON sr.id = s.series_id
       WHERE s.id = $1`,
      [dto.seasonId],
    );
    if (!season) throw new NotFoundException('Season not found');

    const conflict = await this.db.queryOne<{ id: string }>(
      'SELECT id FROM episodes WHERE season_id = $1 AND episode_number = $2',
      [dto.seasonId, dto.episodeNumber],
    );
    if (conflict) throw new ConflictException('Episode number already exists in this season');

    const episode = await this.db.queryOne<EpisodeRow>(
      `INSERT INTO episodes
        (series_id, season_id, episode_number, title, description, poster_url, video_url,
         duration_seconds, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${EPISODE_COLUMNS}`,
      [
        season.seriesId,
        dto.seasonId,
        dto.episodeNumber,
        dto.title,
        dto.description ?? null,
        dto.posterUrl ?? null,
        dto.videoUrl ?? null,
        dto.durationSeconds ?? 0,
        dto.status ?? 'draft',
      ],
    );
    if (!episode) throw new Error('Failed to create episode');

    await this.adminLog.record({
      adminId,
      action: 'episode.create',
      entityType: 'episode',
      entityId: episode.id,
      metadata: {
        seriesId: episode.seriesId,
        seasonId: episode.seasonId,
        episodeNumber: episode.episodeNumber,
      },
    });

    if (episode.status === 'published') {
      await this.notifications.broadcast({
        type: 'episode_published',
        title: `New episode: ${season.seriesTitle}`,
        message: `S${season.seasonNumber}E${episode.episodeNumber} — ${episode.title}`,
        payload: { episodeId: episode.id, seriesId: episode.seriesId },
      });
    }

    return episode;
  }

  async update(adminId: string, id: string, dto: UpdateEpisodeDto): Promise<EpisodeRow> {
    const existing = await this.db.queryOne<{
      status: string;
      seriesTitle: string;
      seasonNumber: number;
      episodeNumber: number;
      seriesId: string;
    }>(
      `SELECT e.status,
              e.episode_number AS "episodeNumber",
              e.series_id AS "seriesId",
              s.season_number AS "seasonNumber",
              sr.title AS "seriesTitle"
       FROM episodes e
       JOIN seasons s ON s.id = e.season_id
       JOIN series sr ON sr.id = e.series_id
       WHERE e.id = $1`,
      [id],
    );
    if (!existing) throw new NotFoundException('Episode not found');

    const episode = await this.db.queryOne<EpisodeRow>(
      `UPDATE episodes SET
         episode_number = COALESCE($2, episode_number),
         title = COALESCE($3, title),
         description = COALESCE($4, description),
         poster_url = COALESCE($5, poster_url),
         video_url = COALESCE($6, video_url),
         duration_seconds = COALESCE($7, duration_seconds),
         status = COALESCE($8, status)
       WHERE id = $1
       RETURNING ${EPISODE_COLUMNS}`,
      [
        id,
        dto.episodeNumber ?? null,
        dto.title ?? null,
        dto.description ?? null,
        dto.posterUrl ?? null,
        dto.videoUrl ?? null,
        dto.durationSeconds ?? null,
        dto.status ?? null,
      ],
    );
    if (!episode) throw new NotFoundException('Episode not found');

    await this.adminLog.record({
      adminId,
      action: 'episode.update',
      entityType: 'episode',
      entityId: episode.id,
      metadata: { episodeNumber: episode.episodeNumber, status: episode.status },
    });

    if (existing.status !== 'published' && episode.status === 'published') {
      await this.notifications.broadcast({
        type: 'episode_published',
        title: `New episode: ${existing.seriesTitle}`,
        message: `S${existing.seasonNumber}E${episode.episodeNumber} — ${episode.title}`,
        payload: { episodeId: episode.id, seriesId: existing.seriesId },
      });
    }

    return episode;
  }

  async remove(adminId: string, id: string): Promise<{ ok: true }> {
    const existing = await this.db.queryOne<{ episodeNumber: number }>(
      'SELECT episode_number AS "episodeNumber" FROM episodes WHERE id = $1',
      [id],
    );
    if (!existing) throw new NotFoundException('Episode not found');
    await this.db.execute('DELETE FROM episodes WHERE id = $1', [id]);
    await this.adminLog.record({
      adminId,
      action: 'episode.delete',
      entityType: 'episode',
      entityId: id,
      metadata: { episodeNumber: existing.episodeNumber },
    });
    return { ok: true };
  }

  private async fetchById(id: string, publishedOnly: boolean): Promise<EpisodeWithRelations> {
    const filter = publishedOnly ? `AND e.status = 'published'` : '';
    const episode = await this.db.queryOne<
      EpisodeRow & {
        seriesIdRel: string;
        seriesTitle: string;
        seasonIdRel: string;
        seasonNumber: number;
      }
    >(
      `SELECT e.id,
              e.series_id AS "seriesId",
              e.season_id AS "seasonId",
              e.episode_number AS "episodeNumber",
              e.title,
              e.description,
              e.poster_url AS "posterUrl",
              e.video_url AS "videoUrl",
              e.duration_seconds AS "durationSeconds",
              e.status,
              e.created_at AS "createdAt",
              e.updated_at AS "updatedAt",
              sr.id AS "seriesIdRel",
              sr.title AS "seriesTitle",
              s.id AS "seasonIdRel",
              s.season_number AS "seasonNumber"
       FROM episodes e
       JOIN series sr ON sr.id = e.series_id
       JOIN seasons s ON s.id = e.season_id
       WHERE e.id = $1 ${filter}`,
      [id],
    );
    if (!episode) throw new NotFoundException('Episode not found');

    const { seriesIdRel, seriesTitle, seasonIdRel, seasonNumber, ...rest } = episode;
    return {
      ...rest,
      series: { id: seriesIdRel, title: seriesTitle },
      season: { id: seasonIdRel, seasonNumber },
    };
  }
}
