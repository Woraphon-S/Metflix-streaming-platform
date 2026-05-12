import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EpisodesController } from './episodes.controller';
import { EpisodesAdminController } from './episodes.admin.controller';
import { EpisodesService } from './episodes.service';
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
  controllers: [EpisodesController, EpisodesAdminController],
  providers: [EpisodesService],
  exports: [EpisodesService],
})
export class EpisodesModule {}
