import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type {
  MovieRow,
  SeriesWithCountsRow,
  UserRole,
  UserStatus,
} from '../../database/types';
import { paginate } from '../../common/dto/pagination-query.dto';

interface DashboardActivity {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  adminEmail: string | null;
}

interface DashboardResult {
  totalUsers: number;
  totalMovies: number;
  totalSeries: number;
  totalEpisodes: number;
  totalNotifications: number;
  recentMovies: MovieRow[];
  recentSeries: SeriesWithCountsRow[];
  recentLogs: DashboardActivity[];
}

interface AdminUserListItem {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  displayName: string;
  avatarUrl: string | null;
  createdAt: Date;
}

@Injectable()
export class AdminService {
  constructor(private readonly db: DatabaseService) {}

  async getDashboard(): Promise<DashboardResult> {
    const totals = await this.db.queryOne<{
      totalUsers: string;
      totalMovies: string;
      totalSeries: string;
      totalEpisodes: string;
      totalNotifications: string;
    }>(
      `SELECT
         (SELECT COUNT(*) FROM users) AS "totalUsers",
         (SELECT COUNT(*) FROM movies) AS "totalMovies",
         (SELECT COUNT(*) FROM series) AS "totalSeries",
         (SELECT COUNT(*) FROM episodes) AS "totalEpisodes",
         (SELECT COUNT(*) FROM notifications) AS "totalNotifications"`,
    );

    const recentMovies = await this.db.query<MovieRow>(
      `SELECT id, title, slug, description,
              poster_url AS "posterUrl",
              backdrop_url AS "backdropUrl",
              trailer_url AS "trailerUrl",
              video_url AS "videoUrl",
              duration_seconds AS "durationSeconds",
              maturity_rating AS "maturityRating",
              status, view_count AS "viewCount",
              created_at AS "createdAt",
              updated_at AS "updatedAt"
       FROM movies ORDER BY created_at DESC LIMIT 5`,
    );

    const recentSeries = await this.db.query<SeriesWithCountsRow>(
      `SELECT s.id, s.title, s.slug, s.description,
              s.poster_url AS "posterUrl",
              s.backdrop_url AS "backdropUrl",
              s.trailer_url AS "trailerUrl",
              s.status, s.view_count AS "viewCount",
              s.created_at AS "createdAt",
              s.updated_at AS "updatedAt",
              (SELECT COUNT(*) FROM seasons WHERE series_id = s.id)::int AS "seasonsCount",
              (SELECT COUNT(*) FROM episodes WHERE series_id = s.id)::int AS "episodesCount"
       FROM series s ORDER BY s.created_at DESC LIMIT 5`,
    );

    const recentLogs = await this.db.query<DashboardActivity>(
      `SELECT l.id, l.action, l.entity_type AS "entityType",
              l.entity_id AS "entityId", l.metadata,
              l.created_at AS "createdAt",
              u.email AS "adminEmail"
       FROM admin_activity_logs l
       LEFT JOIN users u ON u.id = l.admin_id
       ORDER BY l.created_at DESC
       LIMIT 10`,
    );

    return {
      totalUsers: Number(totals?.totalUsers ?? 0),
      totalMovies: Number(totals?.totalMovies ?? 0),
      totalSeries: Number(totals?.totalSeries ?? 0),
      totalEpisodes: Number(totals?.totalEpisodes ?? 0),
      totalNotifications: Number(totals?.totalNotifications ?? 0),
      recentMovies,
      recentSeries,
      recentLogs,
    };
  }

  async listUsers(page: number, pageSize: number, search?: string) {
    const params: unknown[] = [];
    let where = 'TRUE';
    if (search) {
      params.push(`%${search}%`);
      where = `u.email ILIKE $${params.length}`;
    }
    const limitPos = params.push(pageSize);
    const offsetPos = params.push((page - 1) * pageSize);

    const items = await this.db.query<AdminUserListItem>(
      `SELECT u.id, u.email, u.role, u.status,
              COALESCE(p.display_name, split_part(u.email, '@', 1)) AS "displayName",
              p.avatar_url AS "avatarUrl",
              u.created_at AS "createdAt"
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE ${where}
       ORDER BY u.created_at DESC
       LIMIT $${limitPos} OFFSET $${offsetPos}`,
      params,
    );

    const countRow = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*) AS count FROM users u WHERE ${where}`,
      params.slice(0, params.length - 2),
    );
    return paginate(items, Number(countRow?.count ?? 0), page, pageSize);
  }

  async listLogs(page: number, pageSize: number) {
    const items = await this.db.query<DashboardActivity>(
      `SELECT l.id, l.action, l.entity_type AS "entityType",
              l.entity_id AS "entityId", l.metadata,
              l.created_at AS "createdAt",
              u.email AS "adminEmail"
       FROM admin_activity_logs l
       LEFT JOIN users u ON u.id = l.admin_id
       ORDER BY l.created_at DESC
       LIMIT $1 OFFSET $2`,
      [pageSize, (page - 1) * pageSize],
    );

    const countRow = await this.db.queryOne<{ count: string }>(
      'SELECT COUNT(*) AS count FROM admin_activity_logs',
    );
    return paginate(items, Number(countRow?.count ?? 0), page, pageSize);
  }
}
