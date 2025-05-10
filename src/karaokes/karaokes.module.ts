import { Module } from '@nestjs/common';
import { KaraokesService } from './karaokes.service';
import { KaraokesController } from './karaokes.controller';

@Module({
  controllers: [KaraokesController],
  providers: [KaraokesService],
})
export class KaraokesModule {}
