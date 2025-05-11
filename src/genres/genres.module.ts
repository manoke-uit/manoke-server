import { Module } from '@nestjs/common';
import { GenresService } from './genres.service';
import { GenresController } from './genres.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { Song } from 'src/songs/entities/song.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Genre, Song])],
  controllers: [GenresController],
  providers: [GenresService],
})
export class GenresModule {}
