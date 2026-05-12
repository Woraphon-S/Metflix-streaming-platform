import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Public()
  @Get()
  async check() {
    let database = 'ok';
    try {
      await this.db.queryOne('SELECT 1 AS one');
    } catch {
      database = 'error';
    }

    return {
      ok: database === 'ok',
      service: 'metflix-api',
      database,
      timestamp: new Date().toISOString(),
    };
  }
}
