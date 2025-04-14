import { Module } from '@nestjs/common';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Song } from './entities/song.entity';
import { Playlist } from 'src/playlists/entities/playlist.entity';
import { Artist } from 'src/artists/entities/artist.entity';
import { Score } from 'src/scores/entities/score.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Song, Playlist, Artist, Score])],
  controllers: [SongsController],
  providers: [SongsService],
  exports: [SongsService]
  
})
export class SongsModule {}
