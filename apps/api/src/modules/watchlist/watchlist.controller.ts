import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { WatchlistContentType } from '../../database/types';
import { WATCHLIST_CONTENT_TYPES } from '../../database/types';
import { WatchlistService } from './watchlist.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';

const ALLOWED: WatchlistContentType[] = WATCHLIST_CONTENT_TYPES;

@UseGuards(JwtAuthGuard)
@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.watchlistService.list(user.sub);
  }

  @Get(':contentType/:contentId/status')
  exists(
    @CurrentUser() user: JwtPayload,
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
  ) {
    const type = this.validateType(contentType);
    return this.watchlistService.exists(user.sub, type, contentId);
  }

  @Post(':contentType/:contentId')
  add(
    @CurrentUser() user: JwtPayload,
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
  ) {
    const type = this.validateType(contentType);
    return this.watchlistService.add(user.sub, type, contentId);
  }

  @Delete(':contentType/:contentId')
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
  ) {
    const type = this.validateType(contentType);
    return this.watchlistService.remove(user.sub, type, contentId);
  }

  private validateType(value: string): WatchlistContentType {
    if (!ALLOWED.includes(value as WatchlistContentType)) {
      throw new BadRequestException('contentType must be movie or series');
    }
    return value as WatchlistContentType;
  }
}
