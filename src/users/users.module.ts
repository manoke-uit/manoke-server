import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PlaylistsService } from 'src/playlists/playlists.service';
import { Playlist } from 'src/playlists/entities/playlist.entity';
import { Song } from 'src/songs/entities/song.entity';
import { SupabaseStorageModule } from 'src/supabase-storage/supabase-storage.module';
import { UserDevice } from './entities/user-device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Playlist, Song, UserDevice]), SupabaseStorageModule], // Import the TypeOrmModule and specify the User entity
  controllers: [UsersController],
  providers: [UsersService, PlaylistsService],
  exports: [UsersService], // Export the UsersService so it can be used in other modules
})
export class UsersModule {}
