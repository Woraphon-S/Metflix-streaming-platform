import {
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  CONTENT_GENRES,
  CONTENT_HIGHLIGHTS,
  CONTENT_STATUSES,
  type ContentGenre,
  type ContentHighlight,
  type ContentStatus,
} from '../../../database/types';

export class CreateSeriesDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

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

  @IsOptional()
  @IsIn(CONTENT_HIGHLIGHTS)
  highlight?: ContentHighlight;

  @IsOptional()
  @IsIn(CONTENT_GENRES)
  genre?: ContentGenre;
}
