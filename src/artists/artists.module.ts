import { Module } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { ArtistsController } from './artists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from './entities/artist.entity';
import { Song } from 'src/songs/entities/song.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Artist, Song])],
  controllers: [ArtistsController],
  providers: [ArtistsService],
  exports: [ArtistsService]
})
export class ArtistsModule {}
