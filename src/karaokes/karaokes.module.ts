import { Module } from '@nestjs/common';
import { KaraokesService } from './karaokes.service';
import { KaraokesController } from './karaokes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Karaoke } from './entities/karaoke.entity';
import { User } from 'src/users/entities/user.entity';
import { Song } from 'src/songs/entities/song.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Karaoke, Song, User])],
  controllers: [KaraokesController],
  providers: [KaraokesService],
})
export class KaraokesModule {}
