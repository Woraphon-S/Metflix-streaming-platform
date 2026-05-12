import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  NOTIFICATION_TYPES,
  type NotificationType,
} from '../../../database/types';

export class CreateNotificationDto {
  @IsIn(NOTIFICATION_TYPES)
  type!: NotificationType;

  @IsString()
  @MinLength(1)
  @MaxLength(140)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(800)
  message!: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  targetUserId?: string;
}
