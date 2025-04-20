import { Module } from '@nestjs/common';
import { LyricsOvhApiService } from './lyrics.ovh-api.service';

@Module({
  providers: [LyricsOvhApiService],
  exports: [LyricsOvhApiService],
})
export class LyricsOvhApiModule {}
