import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SeriesController } from './series.controller';
import { SeriesAdminController } from './series.admin.controller';
import { SeriesService } from './series.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev_jwt_secret_change_me'),
      }),
    }),
    NotificationsModule,
    AdminModule,
  ],
  controllers: [SeriesController, SeriesAdminController],
  providers: [SeriesService],
  exports: [SeriesService],
})
export class SeriesModule {}
