import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SeriesService } from './series.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Public()
  @Get()
  list(@Query() query: PaginationQueryDto) {
    return this.seriesService.listPublic(
      query.page ?? 1,
      query.pageSize ?? 12,
      query.search,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  detail(@Param('id') id: string) {
    return this.seriesService.getPublic(id);
  }
}
