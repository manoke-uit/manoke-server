import { forwardRef, Module } from '@nestjs/common';
import { SpotifyApiService } from './spotify-api.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SongsModule } from 'src/songs/songs.module';
import { ArtistsModule } from 'src/artists/artists.module';
import { GeniusApiModule } from 'external-apis/genius-api/genius-api.module';

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
    GeniusApiModule,
  ],
  exports: [SpotifyApiService],
})
export class SpotifyApiModule {}
