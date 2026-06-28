import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../../database/database.service';
import type { UserRole } from '../../database/types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';

const FIXED_ADMIN_EMAIL_SUFFIX = '@metflix.local';

export interface AuthResultUser {
  id: string;
  email: string | null;
  role: UserRole;
  displayName: string;
  avatarUrl: string | null;
}

interface UserWithProfile {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: 'active' | 'suspended';
  displayName: string | null;
  avatarUrl: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string; user: AuthResultUser }> {
    const email = dto.email.toLowerCase();

    const existing = await this.db.queryOne<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.db.withTransaction(async (client) => {
      const inserted = await client.query<{
        id: string;
        email: string;
        role: UserRole;
      }>(
        `INSERT INTO users (email, password_hash, role)
         VALUES ($1, $2, 'user')
         RETURNING id, email, role`,
        [email, passwordHash],
      );
      const created = inserted.rows[0];
      await client.query(
        'INSERT INTO profiles (user_id, display_name, is_primary) VALUES ($1, $2, true)',
        [created.id, dto.displayName],
      );
      return created;
    });

    return this.buildAuthResult(user.id, user.email, 'user', {
      displayName: dto.displayName,
      avatarUrl: null,
    });
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: AuthResultUser }> {
    const email = dto.email.toLowerCase();
    const user = await this.findUserWithProfile(email);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (user.status !== 'active') throw new UnauthorizedException('Account suspended');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password');

    return this.buildAuthResult(user.id, user.email, user.role, {
      displayName: user.displayName ?? user.email.split('@')[0],
      avatarUrl: user.avatarUrl,
    });
  }

  async adminLogin(
    dto: AdminLoginDto,
  ): Promise<{ accessToken: string; user: AuthResultUser }> {
    const fixedId = this.config.get<string>('ADMIN_DEV_ID', 'admin');
    const fixedPwd = this.config.get<string>('ADMIN_DEV_PASSWORD', '1234');

    if (dto.id !== fixedId || dto.password !== fixedPwd) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const adminEmail = `${fixedId}${FIXED_ADMIN_EMAIL_SUFFIX}`;
    let admin = await this.findUserWithProfile(adminEmail);

    if (!admin) {
      const passwordHash = await bcrypt.hash(fixedPwd, 10);
      const created = await this.db.withTransaction(async (client) => {
        const userResult = await client.query<{ id: string; email: string }>(
          `INSERT INTO users (email, password_hash, role)
           VALUES ($1, $2, 'admin')
           RETURNING id, email`,
          [adminEmail, passwordHash],
        );
        const newUser = userResult.rows[0];
        await client.query(
          'INSERT INTO profiles (user_id, display_name, is_primary) VALUES ($1, $2, true)',
          [newUser.id, 'METFLIX Admin'],
        );
        return newUser;
      });
      admin = {
        id: created.id,
        email: created.email,
        passwordHash,
        role: 'admin',
        status: 'active',
        displayName: 'METFLIX Admin',
        avatarUrl: null,
      };
    } else if (admin.role !== 'admin') {
      await this.db.execute('UPDATE users SET role = $1 WHERE id = $2', [
        'admin',
        admin.id,
      ]);
      admin.role = 'admin';
    }

    return this.buildAuthResult(admin.id, admin.email, 'admin', {
      displayName: admin.displayName ?? 'METFLIX Admin',
      avatarUrl: admin.avatarUrl,
    });
  }

  async me(userId: string): Promise<AuthResultUser> {
    const user = await this.db.queryOne<{
      id: string;
      email: string;
      role: UserRole;
      displayName: string | null;
      avatarUrl: string | null;
    }>(
      `SELECT u.id,
              u.email,
              u.role,
              p.display_name AS "displayName",
              p.avatar_url AS "avatarUrl"
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id AND p.is_primary = true
       WHERE u.id = $1`,
      [userId],
    );
    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName ?? user.email.split('@')[0],
      avatarUrl: user.avatarUrl,
    };
  }

  private async findUserWithProfile(email: string): Promise<UserWithProfile | null> {
    return this.db.queryOne<UserWithProfile>(
      `SELECT u.id,
              u.email,
              u.password_hash AS "passwordHash",
              u.role,
              u.status,
              p.display_name AS "displayName",
              p.avatar_url AS "avatarUrl"
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id AND p.is_primary = true
       WHERE u.email = $1`,
      [email],
    );
  }

  private async buildAuthResult(
    userId: string,
    email: string,
    role: UserRole,
    profile: { displayName: string; avatarUrl: string | null },
  ): Promise<{ accessToken: string; user: AuthResultUser }> {
    const accessToken = await this.jwt.signAsync({ sub: userId, email, role });
    return {
      accessToken,
      user: {
        id: userId,
        email,
        role,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      },
    };
  }
}
