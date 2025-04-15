import { Module } from '@nestjs/common';
import { SpotifyApiService } from './spotify-api.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  providers: [SpotifyApiService],
  imports: [
    HttpModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService : ConfigService) => ({
            baseURL: configService.get<string>('SPOTIFY_API_URL') || 'https://api.spotify.com/v1',
            headers: {
            'Content-Type': 'application/json',
            },
        }),
    })
  ],
  exports: [SpotifyApiService],
})
export class SpotifyApiModule {}
