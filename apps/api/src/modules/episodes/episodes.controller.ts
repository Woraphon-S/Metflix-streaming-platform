import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { EpisodesService } from './episodes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('episodes')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.episodesService.getPublic(id);
  }

  @Get(':id/next')
  next(@Param('id') id: string) {
    return this.episodesService.getNextEpisode(id);
  }
}
