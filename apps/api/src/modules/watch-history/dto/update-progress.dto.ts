import { IsIn, IsInt, IsUUID, Min } from 'class-validator';
import {
  HISTORY_CONTENT_TYPES,
  type HistoryContentType,
} from '../../../database/types';

export class UpdateProgressDto {
  @IsIn(HISTORY_CONTENT_TYPES)
  contentType!: HistoryContentType;

  @IsUUID()
  contentId!: string;

  @IsInt()
  @Min(0)
  progressSeconds!: number;

  @IsInt()
  @Min(0)
  durationSeconds!: number;
}
