import { Module } from '@nestjs/common';
import { WhisperApiService } from './whisper-api.service';
import { WhisperApiController } from './whisper-api.controller';

@Module({
  providers: [WhisperApiService],
  controllers: [WhisperApiController]
})
export class WhisperApiModule {}
