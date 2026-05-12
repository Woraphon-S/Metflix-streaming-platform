import {
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  CONTENT_STATUSES,
  type ContentStatus,
} from '../../../database/types';

export class UpdateSeriesDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  posterUrl?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  backdropUrl?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  trailerUrl?: string;

  @IsOptional()
  @IsIn(CONTENT_STATUSES)
  status?: ContentStatus;
}
