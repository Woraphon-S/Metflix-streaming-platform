import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { MoviesModule } from './modules/movies/movies.module';
import { SeriesModule } from './modules/series/series.module';
import { SeasonsModule } from './modules/seasons/seasons.module';
import { EpisodesModule } from './modules/episodes/episodes.module';
import { WatchlistModule } from './modules/watchlist/watchlist.module';
import { WatchHistoryModule } from './modules/watch-history/watch-history.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // .env lives at the monorepo root, but `npm --workspace` runs the API with
    // cwd = apps/api, so the default '.env' lookup misses it. Resolve the root
    // .env from this file's compiled location (apps/api/dist) so local dev works
    // regardless of cwd. In Docker, env comes from process.env (which still wins),
    // so the missing file path is simply ignored.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(__dirname, '../../../.env'), '.env'],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    MoviesModule,
    SeriesModule,
    SeasonsModule,
    EpisodesModule,
    WatchlistModule,
    WatchHistoryModule,
    NotificationsModule,
    AdminModule,
    HealthModule,
  ],
})
export class AppModule {}
