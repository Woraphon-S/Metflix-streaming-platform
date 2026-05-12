import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResultRow } from 'pg';
import { SCHEMA_SQL } from './schema';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;

  constructor(config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL');
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }
    this.pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.waitForConnection();
    await this.pool.query(SCHEMA_SQL);
    this.logger.log('database schema ensured');
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<T[]> {
    const result = await this.pool.query<T>(sql, params as unknown[]);
    return result.rows;
  }

  async queryOne<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<T | null> {
    const result = await this.pool.query<T>(sql, params as unknown[]);
    return result.rows[0] ?? null;
  }

  async execute(sql: string, params?: unknown[]): Promise<number> {
    const result = await this.pool.query(sql, params as unknown[]);
    return result.rowCount ?? 0;
  }

  async withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  private async waitForConnection(maxRetries = 20): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        await this.pool.query('SELECT 1');
        return;
      } catch (err) {
        if (attempt === maxRetries) throw err;
        this.logger.warn(
          `postgres not ready (attempt ${attempt}/${maxRetries}), retrying in 2s`,
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }
}
