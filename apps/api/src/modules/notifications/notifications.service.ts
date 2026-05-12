import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type {
  NotificationRow,
  NotificationType,
} from '../../database/types';
import { AdminLogService } from '../admin/admin-log.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

interface BroadcastInput {
  type: NotificationType;
  title: string;
  message: string;
  payload?: Record<string, unknown>;
  targetUserId?: string | null;
}

interface NotificationListItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  payload: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: Date;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly adminLog: AdminLogService,
  ) {}

  async listForUser(userId: string, limit = 30): Promise<NotificationListItem[]> {
    return this.db.query<NotificationListItem>(
      `SELECT n.id,
              n.type,
              n.title,
              n.message,
              n.payload,
              n.created_at AS "createdAt",
              EXISTS (
                SELECT 1 FROM notification_reads r
                WHERE r.notification_id = n.id AND r.user_id = $1
              ) AS "isRead"
       FROM notifications n
       WHERE n.target_user_id = $1 OR n.target_user_id IS NULL
       ORDER BY n.created_at DESC
       LIMIT $2`,
      [userId, limit],
    );
  }

  async unreadCount(userId: string): Promise<{ unread: number }> {
    const row = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*) AS count
       FROM notifications n
       WHERE (n.target_user_id = $1 OR n.target_user_id IS NULL)
         AND NOT EXISTS (
           SELECT 1 FROM notification_reads r
           WHERE r.notification_id = n.id AND r.user_id = $1
         )`,
      [userId],
    );
    return { unread: Number(row?.count ?? 0) };
  }

  async markAsRead(userId: string, notificationId: string): Promise<{ ok: true }> {
    const notification = await this.db.queryOne<{ targetUserId: string | null }>(
      'SELECT target_user_id AS "targetUserId" FROM notifications WHERE id = $1',
      [notificationId],
    );
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.targetUserId && notification.targetUserId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    await this.db.execute(
      `INSERT INTO notification_reads (notification_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (notification_id, user_id) DO NOTHING`,
      [notificationId, userId],
    );
    return { ok: true };
  }

  async markAllAsRead(userId: string): Promise<{ ok: true }> {
    await this.db.execute(
      `INSERT INTO notification_reads (notification_id, user_id)
       SELECT n.id, $1
       FROM notifications n
       WHERE n.target_user_id = $1 OR n.target_user_id IS NULL
       ON CONFLICT (notification_id, user_id) DO NOTHING`,
      [userId],
    );
    return { ok: true };
  }

  async createByAdmin(
    adminId: string,
    dto: CreateNotificationDto,
  ): Promise<NotificationRow> {
    const notification = await this.insertNotification({
      type: dto.type,
      title: dto.title,
      message: dto.message,
      payload: dto.payload,
      targetUserId: dto.targetUserId ?? null,
    });
    await this.adminLog.record({
      adminId,
      action: 'notification.create',
      entityType: 'notification',
      entityId: notification.id,
      metadata: { type: notification.type, targetUserId: notification.targetUserId },
    });
    return notification;
  }

  async broadcast(input: BroadcastInput): Promise<NotificationRow> {
    return this.insertNotification(input);
  }

  private async insertNotification(input: BroadcastInput): Promise<NotificationRow> {
    const row = await this.db.queryOne<NotificationRow>(
      `INSERT INTO notifications (target_user_id, type, title, message, payload)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING id,
                 target_user_id AS "targetUserId",
                 type, title, message, payload,
                 created_at AS "createdAt"`,
      [
        input.targetUserId ?? null,
        input.type,
        input.title,
        input.message,
        input.payload ? JSON.stringify(input.payload) : null,
      ],
    );
    if (!row) throw new Error('Failed to create notification');
    return row;
  }
}
