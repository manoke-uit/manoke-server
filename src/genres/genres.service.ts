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
  async create(createGenreDto: CreateGenreDto) : Promise<Genre | null> {
    const genre = new Genre();
    genre.name = createGenreDto.name;
    if (createGenreDto.songIds && createGenreDto.songIds.length > 0) {
      const songs = await this.songRepository.findBy({
        id: In(createGenreDto.songIds),
      });
      genre.songs = songs;
    }
    else genre.songs = [];
    const savedGenre = await this.genreRepository.save(genre);
    return await this.genreRepository.findOne({
      where: { id: savedGenre.id },
      relations: ['songs'],
    });
  }

  async findAll() : Promise<Genre[]> {
    return await this.genreRepository.find(
      {
        relations: ['songs'],
        order: {
          name: 'ASC',
        },
      }
    );
  }

  async findOne(id: string) : Promise<Genre | null> {
    return await  this.genreRepository.findOne({
      where: { id },
      relations: ['songs'],
    });
  }

  async update(id: string, updateGenreDto: UpdateGenreDto) {
    const genre = await this.genreRepository.findOneBy({ id });
    if (!genre) {
      throw new Error('Genre not found');
    }
    if (updateGenreDto.songIds && updateGenreDto.songIds.length > 0) {
      const songs = await this.songRepository.findBy({
        id: In(updateGenreDto.songIds),
      });
      genre.songs = songs;
    }
    else genre.songs = [];
    genre.name = updateGenreDto.name ?? genre.name;

    const updatedGenre = await this.genreRepository.save(genre);
    return await this.genreRepository.findOne({
      where: { id: updatedGenre.id },
      relations: ['songs'],
    });


  }

  async remove(id: string) : Promise<DeleteResult> {
    return await this.genreRepository.delete(id);
  }
}
