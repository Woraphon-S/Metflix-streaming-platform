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
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/movies')
export class MoviesAdminController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  list(@Query() query: PaginationQueryDto) {
    return this.moviesService.listAll(
      query.page ?? 1,
      query.pageSize ?? 20,
      query.search,
    );
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.moviesService.getAny(id);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateMovieDto) {
    return this.moviesService.create(user.sub, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateMovieDto,
  ) {
    return this.moviesService.update(user.sub, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.moviesService.remove(user.sub, id);
  }
}
