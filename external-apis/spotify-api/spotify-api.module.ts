import { forwardRef, Module } from '@nestjs/common';
import { SpotifyApiService } from './spotify-api.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SongsModule } from 'src/songs/songs.module';
import { ArtistsModule } from 'src/artists/artists.module';
import { LyricsOvhApiModule } from 'external-apis/lyrics.ovh-api/lyrics.ovh-api.module';
import { DeezerApiModule } from 'external-apis/deezer-api/deezer-api.module';

@Module({
  providers: [SpotifyApiService],
  imports: [
    HttpModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService : ConfigService) => ({
            baseURL: configService.get<string>('SPOTIFY_BASE_URL') || 'https://api.spotify.com/v1',
            headers: {
            'Content-Type': 'application/json',
            },
        }),
    }),
    forwardRef(()=>SongsModule), // avoid circular dependency
    ArtistsModule,
    LyricsOvhApiModule,
    DeezerApiModule
  ],
  exports: [SpotifyApiService],
})
export class SpotifyApiModule {}
