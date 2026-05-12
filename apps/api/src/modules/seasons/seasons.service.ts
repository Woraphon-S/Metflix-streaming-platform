import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { SeasonRow } from '../../database/types';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { AdminLogService } from '../admin/admin-log.service';

const SEASON_COLUMNS = `
  id,
  series_id AS "seriesId",
  season_number AS "seasonNumber",
  title,
  description,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

@Injectable()
export class SeasonsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly adminLog: AdminLogService,
  ) {}

  async create(adminId: string, dto: CreateSeasonDto): Promise<SeasonRow> {
    const series = await this.db.queryOne<{ id: string }>(
      'SELECT id FROM series WHERE id = $1',
      [dto.seriesId],
    );
    if (!series) throw new NotFoundException('Series not found');

    const conflict = await this.db.queryOne<{ id: string }>(
      'SELECT id FROM seasons WHERE series_id = $1 AND season_number = $2',
      [dto.seriesId, dto.seasonNumber],
    );
    if (conflict) throw new ConflictException('Season number already exists for this series');

    const season = await this.db.queryOne<SeasonRow>(
      `INSERT INTO seasons (series_id, season_number, title, description)
       VALUES ($1, $2, $3, $4)
       RETURNING ${SEASON_COLUMNS}`,
      [dto.seriesId, dto.seasonNumber, dto.title, dto.description ?? null],
    );
    if (!season) throw new Error('Failed to create season');

    await this.adminLog.record({
      adminId,
      action: 'season.create',
      entityType: 'season',
      entityId: season.id,
      metadata: { seriesId: season.seriesId, seasonNumber: season.seasonNumber },
    });

    return season;
  }

  async update(adminId: string, id: string, dto: UpdateSeasonDto): Promise<SeasonRow> {
    const season = await this.db.queryOne<SeasonRow>(
      `UPDATE seasons SET
         season_number = COALESCE($2, season_number),
         title = COALESCE($3, title),
         description = COALESCE($4, description)
       WHERE id = $1
       RETURNING ${SEASON_COLUMNS}`,
      [id, dto.seasonNumber ?? null, dto.title ?? null, dto.description ?? null],
    );
    if (!season) throw new NotFoundException('Season not found');

    await this.adminLog.record({
      adminId,
      action: 'season.update',
      entityType: 'season',
      entityId: season.id,
      metadata: { seasonNumber: season.seasonNumber },
    });
    return season;
  }

  async remove(adminId: string, id: string): Promise<{ ok: true }> {
    const existing = await this.db.queryOne<{ seasonNumber: number }>(
      'SELECT season_number AS "seasonNumber" FROM seasons WHERE id = $1',
      [id],
    );
    if (!existing) throw new NotFoundException('Season not found');
    await this.db.execute('DELETE FROM seasons WHERE id = $1', [id]);
    await this.adminLog.record({
      adminId,
      action: 'season.delete',
      entityType: 'season',
      entityId: id,
      metadata: { seasonNumber: existing.seasonNumber },
    });
    return { ok: true };
  }
}
