import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { Playlist } from './entities/playlist.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Song } from 'src/songs/entities/song.entity';
import { User } from 'src/users/entities/user.entity';
import { Notification } from 'src/notifications/entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Playlist, Song, User])], // Import the TypeOrmModule and specify the User entity
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  exports: [PlaylistsService]
})
export class PlaylistsModule {}
