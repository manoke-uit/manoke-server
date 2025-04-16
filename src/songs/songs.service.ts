import { Injectable } from '@nestjs/common';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository, UpdateResult } from 'typeorm';
import { Song } from './entities/song.entity';
import { Artist } from 'src/artists/entities/artist.entity';
import { Score } from 'src/scores/entities/score.entity';
import { Playlist } from 'src/playlists/entities/playlist.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { SpotifyApiService } from 'external-apis/spotify-api/spotify-api.service';

@Injectable()
export class SongsService {
  constructor(
    @InjectRepository(Song) 
    private songRepository: Repository<Song>,
    @InjectRepository(Artist) 
    private artistRepository: Repository<Artist>,
    @InjectRepository(Playlist) 
    private playlistRepository: Repository<Playlist>,

    private spotifyApiService: SpotifyApiService,
  ) {}
  async create(createSongDto: CreateSongDto): Promise<Song> {
    const song = new Song()
    
    song.title = createSongDto.title; 
    song.albumTitle = createSongDto.albumTitle; 
    song.imageUrl = createSongDto.imageUrl; 
    song.releasedDate = createSongDto.releasedDate;
    song.duration = createSongDto.duration; 
    song.youtubeUrl = createSongDto.youtubeUrl; 
    song.audioUrl = createSongDto.audioUrl;
    song.lyrics = createSongDto.lyrics ? createSongDto.lyrics : ""; // if not found in db, then search in lyrics.ovh-api
    
    if (createSongDto.artistIds && createSongDto.artistIds.length > 0) {
      const artists = await this.artistRepository.findBy({
        id: In(createSongDto.artistIds),
      });
      song.artists = artists;
    } else {
      song.artists = [];
    }

    if (createSongDto.playlistIds && createSongDto.playlistIds.length > 0) {
      const playlists = await this.playlistRepository.findBy({
        id: In(createSongDto.playlistIds), 
      });
      song.playlists = playlists; 
    } else {
      song.playlists = [];
    }

    return this.songRepository.save(song);
  }

  findAll(): Promise<Song[]> {
    return this.songRepository.find();
  }

  findOne(id: string): Promise<Song | null> {
    return this.songRepository.findOneBy({ id })
  }

  update(id: string, updateSongDto: UpdateSongDto): Promise<UpdateResult> {
    return this.songRepository.update(id, updateSongDto);
  }

  remove(id: string): Promise<DeleteResult> {
    return this.songRepository.delete(id);
  }

  paginate(options: IPaginationOptions): Promise<Pagination<Song>> {
      return paginate<Song>(this.songRepository, options);
  }

  async search(query: string): Promise<Song[]> {
    if (!query) return [];
    const song = await this.songRepository.findBy({ title: query });
    if (song.length > 0) return song;
    return await this.spotifyApiService.searchSongs(query);
  }

}
