import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

interface RecordInput {
  adminId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AdminLogService {
  constructor(private readonly db: DatabaseService) {}

  async record(input: RecordInput): Promise<void> {
    await this.db.execute(
      `INSERT INTO admin_activity_logs (admin_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [
        input.adminId,
        input.action,
        input.entityType,
        input.entityId ?? null,
        input.metadata ? JSON.stringify(input.metadata) : null,
      ],
    );
  }
}
