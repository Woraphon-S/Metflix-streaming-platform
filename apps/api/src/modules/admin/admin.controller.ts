import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  users(@Query() query: PaginationQueryDto) {
    return this.adminService.listUsers(
      query.page ?? 1,
      query.pageSize ?? 20,
      query.search,
    );
  }

  @Get('activity-logs')
  logs(@Query() query: PaginationQueryDto) {
    return this.adminService.listLogs(query.page ?? 1, query.pageSize ?? 30);
  }
}
