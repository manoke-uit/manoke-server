import { forwardRef, Module } from '@nestjs/common';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Song } from './entities/song.entity';
import { Playlist } from 'src/playlists/entities/playlist.entity';
import { Artist } from 'src/artists/entities/artist.entity';
import { Score } from 'src/scores/entities/score.entity';
import { SpotifyApiModule } from 'external-apis/spotify-api/spotify-api.module';

@Module({
  imports: [TypeOrmModule.forFeature([Song, Playlist, Artist, Score]), 
  forwardRef(()=>SpotifyApiModule) // avoid circular dependency
],
  controllers: [SongsController],
  providers: [SongsService],
  exports: [SongsService]
  
})
export class SongsModule {}
