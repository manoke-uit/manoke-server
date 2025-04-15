import { Module } from '@nestjs/common';
import { YoutubeApiService } from './youtube-api.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { YoutubeApiController } from './youtube-api.controller';

@Module({
  providers: [YoutubeApiService],
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService : ConfigService) => ({
        baseURL: configService.get<string>('YOUTUBE_BASE_URL') || 'https://www.googleapis.com/youtube/v3',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    })
  ],
  exports: [YoutubeApiService],
  controllers: [YoutubeApiController],
})
export class YoutubeApiModule {}
