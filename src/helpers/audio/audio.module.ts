import { Module } from '@nestjs/common';
import { AudioService } from './audio.service';

@Module({
  providers: [AudioService],
  exports: [AudioService], // Export the AudioService so it can be used in other modules
})
export class AudioModule {}
