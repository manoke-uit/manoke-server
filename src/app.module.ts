import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { SongsModule } from './songs/songs.module';
import { ArtistsModule } from './artists/artists.module';
import { ScoresModule } from './scores/scores.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [UsersModule, PlaylistsModule, SongsModule, ArtistsModule, ScoresModule, NotificationsModule, FriendsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
