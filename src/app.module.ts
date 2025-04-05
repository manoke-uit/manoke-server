import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { SongsModule } from './songs/songs.module';
import { ArtistsModule } from './artists/artists.module';
import { ScoresModule } from './scores/scores.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FriendsModule } from './friends/friends.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import * as joi from 'joi';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'database/database-source';

@Module({
  imports: [ConfigModule.forRoot({ // these are for joi validation
    isGlobal: true,
    envFilePath: '.env',
    load: [configuration],
    validationSchema: joi.object({
      DB_HOST: joi.string().required(),
      DB_PORT: joi.number().default(5432),
      DB_USERNAME: joi.string().required(),
      DB_PASSWORD: joi.string().required(),
      DB_DATABASE: joi.string().required(),
      //JWT_SECRET: joi.string().required(),
      //JWT_EXPIRATION_TIME: joi.string().default('1h'),
      //NODE_ENV: joi.string().valid('development', 'production').default('development'),
    })
  }),
  UsersModule, 
  PlaylistsModule, 
  SongsModule, 
  ArtistsModule, 
  ScoresModule, 
  NotificationsModule, 
  FriendsModule,
  TypeOrmModule.forRootAsync(typeOrmConfig),
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource : DataSource) {}

  // apply middleware later if needed
  // configure(consumer: MiddlewareConsumer) {

  async onModuleInit() {
    if (this.dataSource.isInitialized) {
      console.log('Data source is already initialized');
    }
    else {
      console.log('Data source has NOT been initialized');
    }
  }

}
