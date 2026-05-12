import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  CONTENT_STATUSES,
  type ContentStatus,
} from '../../../database/types';

export class CreateEpisodeDto {
  @IsUUID()
  seasonId!: string;

  @IsInt()
  @Min(1)
  episodeNumber!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  posterUrl?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  videoUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @IsOptional()
  @IsIn(CONTENT_STATUSES)
  status?: ContentStatus;
}
