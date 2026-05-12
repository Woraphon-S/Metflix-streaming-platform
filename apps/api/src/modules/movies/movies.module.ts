import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MoviesController } from './movies.controller';
import { MoviesAdminController } from './movies.admin.controller';
import { MoviesService } from './movies.service';
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
  controllers: [MoviesController, MoviesAdminController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
