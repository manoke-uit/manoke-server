import { Injectable } from '@nestjs/common';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, ILike, In, Repository, UpdateResult } from 'typeorm';
import { Song } from './entities/song.entity';
import { Artist } from 'src/artists/entities/artist.entity';
import { Score } from 'src/scores/entities/score.entity';
import { Playlist } from 'src/playlists/entities/playlist.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { SpotifyApiService } from 'src/external-apis/spotify-api/spotify-api.service';
import { title } from 'process';
import { DeezerApiService } from 'src/external-apis/deezer-api/deezer-api.service';
import * as ytdl from 'ytdl-core';

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
    private deezerApiService: DeezerApiService,
  ) {}
  async create(createSongDto: CreateSongDto): Promise<Song> {
    const song = new Song()
    
    song.title = createSongDto.title;
    song.songUrl = createSongDto.songUrl;
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

  findOnePrecisely(title: string, artistName: string): Promise<Song | null> {
    return this.songRepository.findOne({
      where: {
        title: ILike(`%${title}%`),
        artists: { name: ILike(artistName) },
      },
      relations: { artists: true, playlists: true },
    });
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

  // async search(query: string): Promise<Song[]> {
  //   if (!query) return [];
  //   // search for songs in database
  //   query = decodeURIComponent(query);
  //   const queryLower = query.toLowerCase();
  //   const songs = await this.songRepository.find({
  //     where: {
  //       title: ILike(`%${queryLower}%`),
  //     },
  //     relations: {artists: true, playlists: true},
  //   });

  //   if (songs.length > 0) return songs;
  //   return await this.spotifyApiService.searchSongs(query);
  // }

  // modify later!!
  async search(query: string): Promise<Song[]> {
    return this.songRepository.find({
      where: {
        title: ILike(`%${query}%`),
      },
      relations: { artists: true, playlists: true },
    });
  }

  // TODO: add search with youtube url
  // async searchWithYoutube(youtubeUrl: string): Promise<Song[]> {
  //   try {
  //     if (!youtubeUrl || !ytdl.validateURL(youtubeUrl)) return [];
  //     // search for songs in database
  //     const videoInfo = await ytdl.getBasicInfo(youtubeUrl);

  //     const query = `${await this.extractTitle(videoInfo.videoDetails.title)}`;
  //     const queryLower = query.toLowerCase();
  
  //     console.log(query);
  //     const songs = await this.songRepository.find({
  //       where: {
  //         title: ILike(`%${queryLower}%`),
  //       },
  //       relations: {artists: true, playlists: true},
  //     });
  //     for(const song of songs) {
  //       if(!song.songUrl) continue;
  //       // check if deezer preview is valid
  //       const isValid = await this.deezerApiService.isDeezerPreviewValid(song.songUrl);
  //       if(!isValid && song.artists.length > 0){
  //         song.songUrl = await this.deezerApiService.getDeezerPreviewUrl(song.title, song.artists[0].name);
  //         console.log(song.songUrl);
  //         await this.songRepository.save(song);
  //       }
  //     }
  
  //     if (songs.length > 0) return songs;
  //     return await this.spotifyApiService.searchSongsWithYoutube(youtubeUrl, query);
  //   } catch (error) {
  //     console.error("Error fetching video info:", error.message);
  //     throw new Error("Failed to extract video information");
  //   }
  // }

  async extractTitle(originalTitle: string) {
    const unwantedKeywords = [
      /\bkaraoke\b/gi,
      /\btone\b/gi,
      /\bnữ\b/gi,
      /\bnam\b/gi,
      /\bnhạc sống\b/gi,
      /\bbeat\b/gi,
      /\bacoustic\b/gi,
      /\bguitar\b/gi,
      /\bgốc\b/gi,
      /\bhay\b/gi,
      /\bchuẩn\b/gi,
      /\[.*?\]/g, 
      /\(.*?\)/g, 
      /\|/g,
      /\-/g
    ];

    let cleaned = originalTitle;

    for (const keyword of unwantedKeywords) {
      cleaned = cleaned.replace(keyword, '');
    }

    cleaned = cleaned.replace('/\s+/g', ' ').trim();

    return cleaned.trim();
  }
}
