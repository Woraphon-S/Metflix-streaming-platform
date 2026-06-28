import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DEFAULT_AVATAR_KEY } from './profile-avatars';

const MAX_PROFILES = 5;

export interface ProfileDto {
  id: string;
  displayName: string;
  avatarKey: string | null;
  isPrimary: boolean;
}

const SELECT = `
  id,
  display_name AS "displayName",
  avatar_key AS "avatarKey",
  is_primary AS "isPrimary"
`;

@Injectable()
export class ProfilesService {
  constructor(private readonly db: DatabaseService) {}

  async list(userId: string): Promise<ProfileDto[]> {
    return this.db.query<ProfileDto>(
      `SELECT ${SELECT} FROM profiles
       WHERE user_id = $1
       ORDER BY is_primary DESC, created_at ASC`,
      [userId],
    );
  }

  async create(userId: string, dto: CreateProfileDto): Promise<ProfileDto> {
    const count = await this.db.queryOne<{ count: string }>(
      'SELECT COUNT(*) AS count FROM profiles WHERE user_id = $1',
      [userId],
    );
    if (Number(count?.count ?? 0) >= MAX_PROFILES) {
      throw new BadRequestException(`สร้างโปรไฟล์ได้สูงสุด ${MAX_PROFILES} โปรไฟล์`);
    }

    const row = await this.db.queryOne<ProfileDto>(
      `INSERT INTO profiles (user_id, display_name, avatar_key, is_primary)
       VALUES ($1, $2, $3, false)
       RETURNING ${SELECT}`,
      [userId, dto.displayName, dto.avatarKey ?? DEFAULT_AVATAR_KEY],
    );
    if (!row) throw new Error('Failed to create profile');
    return row;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateProfileDto,
  ): Promise<ProfileDto> {
    await this.assertOwnership(userId, id);
    const row = await this.db.queryOne<ProfileDto>(
      `UPDATE profiles SET
         display_name = COALESCE($3, display_name),
         avatar_key = COALESCE($4, avatar_key)
       WHERE id = $1 AND user_id = $2
       RETURNING ${SELECT}`,
      [id, userId, dto.displayName ?? null, dto.avatarKey ?? null],
    );
    if (!row) throw new NotFoundException('Profile not found');
    return row;
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    const target = await this.assertOwnership(userId, id);
    if (target.isPrimary) {
      throw new BadRequestException('ลบโปรไฟล์หลักไม่ได้');
    }
    const count = await this.db.queryOne<{ count: string }>(
      'SELECT COUNT(*) AS count FROM profiles WHERE user_id = $1',
      [userId],
    );
    if (Number(count?.count ?? 0) <= 1) {
      throw new BadRequestException('ต้องมีอย่างน้อย 1 โปรไฟล์');
    }
    await this.db.execute('DELETE FROM profiles WHERE id = $1 AND user_id = $2', [
      id,
      userId,
    ]);
    return { ok: true };
  }

  async assertOwnership(userId: string, profileId: string): Promise<ProfileDto> {
    const row = await this.db.queryOne<ProfileDto>(
      `SELECT ${SELECT} FROM profiles WHERE id = $1 AND user_id = $2`,
      [profileId, userId],
    );
    if (!row) throw new NotFoundException('Profile not found');
    return row;
  }
}
