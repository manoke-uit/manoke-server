import { Module } from '@nestjs/common';
import { YoutubeApiService } from './youtube-api.service';

@Module({
  providers: [YoutubeApiService]
})
export class YoutubeApiModule {}
