import { Injectable } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { DeleteResult, In, Repository, UpdateResult } from 'typeorm';
import { Song } from 'src/songs/entities/song.entity';

@Injectable()
export class GenresService {
  @InjectRepository(Genre)
  private readonly genreRepository: Repository<Genre>;
  @InjectRepository(Song)
  private readonly songRepository: Repository<Song>;
  async create(createGenreDto: CreateGenreDto) : Promise<Genre> {
    const genre = new Genre();
    genre.name = createGenreDto.name;
    if (createGenreDto.songIds && createGenreDto.songIds.length > 0) {
      const songs = await this.songRepository.findBy({
        id: In(createGenreDto.songIds),
      });
      genre.songs = songs;
    }
    else genre.songs = [];
    return this.genreRepository.save(genre);
  }

  async findAll() : Promise<Genre[]> {
    return this.genreRepository.find();
  }

  async findOne(id: string) : Promise<Genre | null> {
    return this.genreRepository.findOne({
      where: { id },
      relations: ['songs'],
    });
  }

  async update(id: string, updateGenreDto: UpdateGenreDto) : Promise<UpdateResult> {
    return this.genreRepository.update(id, updateGenreDto);

  }

  async remove(id: string) : Promise<DeleteResult> {
    return this.genreRepository.delete(id);
  }
}
