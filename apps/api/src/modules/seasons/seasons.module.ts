import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SeasonsAdminController } from './seasons.admin.controller';
import { SeasonsService } from './seasons.service';
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
    AdminModule,
  ],
  controllers: [SeasonsAdminController],
  providers: [SeasonsService],
  exports: [SeasonsService],
})
export class SeasonsModule {}
