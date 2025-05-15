import { Injectable } from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository, UpdateResult } from 'typeorm';
import { Artist } from './entities/artist.entity';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin-guard';
import { Song } from 'src/songs/entities/song.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist) 
    private artistRepository: Repository<Artist>,
    @InjectRepository(Song) 
    private songRepository: Repository<Song>
  ) {}

  async create(createArtistDto: CreateArtistDto): Promise<Artist> {
    const artist = new Artist();

    artist.name = createArtistDto.name; 
    artist.imageUrl = createArtistDto.imageUrl;
    
    if (createArtistDto.songIds && createArtistDto.songIds.length > 0) {
      const songs = await this.songRepository.findBy({
        id: In(createArtistDto.songIds)
      })
      artist.songs = songs;
    } else {
      artist.songs = [];
    }
    
    return this.artistRepository.save(artist);
  }

  async findAll(): Promise<Artist[]> {
    return await this.artistRepository.find();
  }

  async findOne(id: string): Promise<Artist | null> {
    return await this.artistRepository.findOneBy({ id });
  }

  // async findOneBySpotifyId(spotifyId: string): Promise<Artist | null> {
  //   return this.artistRepository.findOneBy({ spotifyId });
  // }

  async update(id: string, updateArtistDto: UpdateArtistDto) {
    const artist = await this.artistRepository.findOneBy({ id });
    if (!artist) {
      throw new Error('Artist not found');
    }
    if (updateArtistDto.songIds && updateArtistDto.songIds.length > 0) {
      const songs = await this.songRepository.findBy({
        id: In(updateArtistDto.songIds)
      })
      artist.songs = songs;
    } else {
      artist.songs = [];
    }
    return await this.artistRepository.save(artist);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.artistRepository.delete(id);
  }

  paginate(options: IPaginationOptions): Promise<Pagination<Artist>> {
    return paginate<Artist>(this.artistRepository, options);
  }
}


