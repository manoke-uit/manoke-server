"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = exports.typeOrmConfig = void 0;
const config_1 = require("@nestjs/config");
const artist_entity_1 = require("../src/artists/entities/artist.entity");
const friend_entity_1 = require("../src/friends/entities/friend.entity");
const playlist_entity_1 = require("../src/playlists/entities/playlist.entity");
const score_entity_1 = require("../src/scores/entities/score.entity");
const song_entity_1 = require("../src/songs/entities/song.entity");
const user_entity_1 = require("../src/users/entities/user.entity");
const notification_entity_1 = require("../src/notifications/entities/notification.entity");
const typeorm_1 = require("typeorm");
const dotenv = require("dotenv");
const genre_entity_1 = require("../src/genres/entities/genre.entity");
const karaoke_entity_1 = require("../src/karaokes/entities/karaoke.entity");
const post_entity_1 = require("../src/posts/entities/post.entity");
const comment_entity_1 = require("../src/comments/entities/comment.entity");
exports.typeOrmConfig = {
    imports: [config_1.ConfigModule.forRoot()],
    inject: [config_1.ConfigService],
    useFactory: async (configService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [artist_entity_1.Artist, friend_entity_1.Friend, notification_entity_1.Notification, playlist_entity_1.Playlist, score_entity_1.Score, song_entity_1.Song, user_entity_1.User, genre_entity_1.Genre, karaoke_entity_1.Karaoke, post_entity_1.Post, comment_entity_1.Comment],
        migrations: ['dist/database/migrations/*.js'],
        synchronize: true,
    })
};
dotenv.config({ path: '.env' });
exports.dataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    migrations: ['dist/database/migrations/*.js'],
    entities: ["dist/**/*.entity.js"],
};
const dataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
exports.default = dataSource;
//# sourceMappingURL=database-source.js.map