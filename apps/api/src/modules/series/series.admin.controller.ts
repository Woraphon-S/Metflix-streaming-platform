import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SeriesService } from './series.service';
import { CreateSeriesDto } from './dto/create-series.dto';
import { UpdateSeriesDto } from './dto/update-series.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/series')
export class SeriesAdminController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  list(@Query() query: PaginationQueryDto) {
    return this.seriesService.listAll(
      query.page ?? 1,
      query.pageSize ?? 20,
      query.search,
    );
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.seriesService.getAny(id);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSeriesDto) {
    return this.seriesService.create(user.sub, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateSeriesDto,
  ) {
    return this.seriesService.update(user.sub, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.seriesService.remove(user.sub, id);
  }
}
