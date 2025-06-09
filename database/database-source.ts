import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Artist } from 'src/artists/entities/artist.entity';
import { Friend } from 'src/friends/entities/friend.entity';
import { Playlist } from 'src/playlists/entities/playlist.entity';
import { Score } from 'src/scores/entities/score.entity';
import { Song } from 'src/songs/entities/song.entity';
import { User } from 'src/users/entities/user.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { Genre } from 'src/genres/entities/genre.entity';
import { Karaoke } from 'src/karaokes/entities/karaoke.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { UserDevice } from 'src/users/entities/user-device.entity';

export const typeOrmConfig : TypeOrmModuleAsyncOptions = {
    imports: [ConfigModule.forRoot()],
    inject: [ConfigService], // remember to inject configService in constructor
    useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [Artist, Friend, Notification, Playlist, Score, Song, User, Genre, Karaoke, Post, Comment, UserDevice], // exact one for webpack usage
        migrations: ['dist/database/migrations/*.js'],
        synchronize: false, // for dev only, set to false in prod
    })
}

dotenv.config({ path: '.env' });

// for cli
export const dataSourceOptions : DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    migrations: ['dist/database/migrations/*.js'],
    entities: ["dist/**/*.entity.js"], 
}

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;