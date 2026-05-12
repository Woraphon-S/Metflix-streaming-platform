import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { UserRole } from '../../database/types';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface ProfileResult {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  avatarUrl: string | null;
  memberSince: Date;
  stats: { watched: number; completed: number; myList: number };
}

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async getProfile(userId: string): Promise<ProfileResult> {
    const user = await this.db.queryOne<{
      id: string;
      email: string;
      role: UserRole;
      createdAt: Date;
      displayName: string | null;
      avatarUrl: string | null;
    }>(
      `SELECT u.id,
              u.email,
              u.role,
              u.created_at AS "createdAt",
              p.display_name AS "displayName",
              p.avatar_url AS "avatarUrl"
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [userId],
    );
    if (!user) throw new NotFoundException('User not found');

    const counts = await this.db.queryOne<{
      watched: string;
      completed: string;
      myList: string;
    }>(
      `SELECT
         (SELECT COUNT(*) FROM watch_histories WHERE user_id = $1) AS watched,
         (SELECT COUNT(*) FROM watch_histories WHERE user_id = $1 AND completed_at IS NOT NULL) AS completed,
         (SELECT COUNT(*) FROM watchlists WHERE user_id = $1) AS "myList"`,
      [userId],
    );

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName ?? user.email.split('@')[0],
      avatarUrl: user.avatarUrl,
      memberSince: user.createdAt,
      stats: {
        watched: Number(counts?.watched ?? 0),
        completed: Number(counts?.completed ?? 0),
        myList: Number(counts?.myList ?? 0),
      },
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileResult> {
    const existing = await this.db.queryOne<{ id: string }>(
      'SELECT id FROM profiles WHERE user_id = $1',
      [userId],
    );

    if (!existing) {
      await this.db.execute(
        `INSERT INTO profiles (user_id, display_name, avatar_url)
         VALUES ($1, $2, $3)`,
        [userId, dto.displayName ?? 'New User', dto.avatarUrl ?? null],
      );
    } else {
      await this.db.execute(
        `UPDATE profiles
         SET display_name = COALESCE($2, display_name),
             avatar_url = COALESCE($3, avatar_url)
         WHERE user_id = $1`,
        [userId, dto.displayName ?? null, dto.avatarUrl ?? null],
      );
    }
    return this.getProfile(userId);
  }
}
