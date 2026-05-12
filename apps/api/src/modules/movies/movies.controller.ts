import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Public()
  @Get()
  list(@Query() query: PaginationQueryDto) {
    return this.moviesService.listPublic(
      query.page ?? 1,
      query.pageSize ?? 12,
      query.search,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async detail(@Param('id') id: string) {
    const movie = await this.moviesService.getPublic(id);
    return movie;
  }
}
