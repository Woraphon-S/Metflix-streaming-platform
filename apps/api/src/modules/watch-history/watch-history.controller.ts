import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { HistoryContentType } from '../../database/types';
import { HISTORY_CONTENT_TYPES } from '../../database/types';
import { WatchHistoryService } from './watch-history.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProfileId } from '../../common/decorators/profile-id.decorator';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';

const ALLOWED: HistoryContentType[] = HISTORY_CONTENT_TYPES;

@UseGuards(JwtAuthGuard)
@Controller('watch-history')
export class WatchHistoryController {
  constructor(private readonly watchHistoryService: WatchHistoryService) {}

  @Get('continue')
  getContinue(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: string,
    @ProfileId() profileId?: string,
  ) {
    return this.watchHistoryService.getContinueWatching(
      user.sub,
      this.requireProfile(profileId),
      Number(limit ?? 12),
    );
  }

  @Get(':contentType/:contentId')
  getOne(
    @CurrentUser() user: JwtPayload,
    @Param('contentType') contentType: string,
    @Param('contentId') contentId: string,
    @ProfileId() profileId?: string,
  ) {
    if (!ALLOWED.includes(contentType as HistoryContentType)) {
      throw new BadRequestException('contentType must be movie or episode');
    }
    return this.watchHistoryService.getOne(
      user.sub,
      this.requireProfile(profileId),
      contentType as HistoryContentType,
      contentId,
    );
  }

  @Post('progress')
  updateProgress(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProgressDto,
    @ProfileId() profileId?: string,
  ) {
    return this.watchHistoryService.updateProgress(
      user.sub,
      this.requireProfile(profileId),
      dto,
    );
  }

  private requireProfile(profileId?: string): string {
    if (!profileId) {
      throw new BadRequestException('No active profile selected');
    }
    return profileId;
  }
}
