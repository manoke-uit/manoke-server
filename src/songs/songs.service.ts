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
import { AudioService } from 'src/helpers/audio/audio.service';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { Genre } from 'src/genres/entities/genre.entity';

@Injectable()
export class SongsService {
  constructor(
    @InjectRepository(Song) 
    private songRepository: Repository<Song>,
    @InjectRepository(Artist) 
    private artistRepository: Repository<Artist>,
    @InjectRepository(Playlist) 
    private playlistRepository: Repository<Playlist>,
    @InjectRepository(Genre)
    private genreRepository: Repository<Genre>,

    private spotifyApiService: SpotifyApiService,
    private deezerApiService: DeezerApiService,
    private audioService: AudioService,
    private supabaseStorageService: SupabaseStorageService,
  ) {}
  async create(fileBuffer: Buffer, fileName: string, createSongDto: CreateSongDto): Promise<Song | null> {
    const song = new Song()
    
    song.title = createSongDto.title;
    const sanitizedLyrics = (text: string): string =>
    text
      .normalize('NFD')                           // separate accents
      .replace(/[\u0300-\u036f]/g, '')            // remove accents
      .replace(/[.,!?"]/g, '')                    // remove punctuation
      .replace(/\s+/g, ' ')                       // collapse whitespace
      .trim()
      .toLowerCase();
    song.lyrics = sanitizedLyrics(createSongDto.lyrics.trim());

    const songBuffer = fileBuffer;
    const songLength = await this.audioService.getDurationFromBuffer(songBuffer);
    const audioFileName = `${sanitizeFileName(createSongDto.title)}-${Date.now()}.mp3`;

    if (songLength < 30) {
      throw new Error("Audio length must be at least 30 seconds.");
    }

    if (songLength > 30) {
      const chunks = await this.audioService.splitAudioFile(songBuffer, audioFileName);
      if (chunks.length > 0) {
        if(chunks.length > 3){
          const chunk = chunks[Math.ceil(chunks.length/2)];
          const uploadedAudio = await this.supabaseStorageService.uploadSnippetFromBuffer(chunk, audioFileName);
          if (!uploadedAudio) {
            throw new Error("Failed to upload audio chunk");
          }
          song.songUrl = uploadedAudio || "";
        }
        else {
          const chosenIndex = Math.floor(Math.random() * chunks.length);
          const chunk = chunks[chosenIndex];
          const uploadedAudio = await this.supabaseStorageService.uploadSnippetFromBuffer(chunk, audioFileName);
          if (!uploadedAudio) {
            throw new Error("Failed to upload audio chunk");
          }
          song.songUrl = uploadedAudio || "";
        }
        
      }
    } else {
      const uploadedAudio = await this.supabaseStorageService.uploadSnippetFromBuffer(songBuffer, audioFileName);
      if (!uploadedAudio) {
        throw new Error("Failed to upload audio");
      }
      song.songUrl = uploadedAudio || "";
    }
    
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

    const savedSong = await this.songRepository.save(song);
    const result = await this.songRepository.findOne({
      where: {id: savedSong.id},
      relations: {
        genres: true,
        artists: true,
        playlists: true
      }
    });
    return result;
  }

  findAll(): Promise<Song[]> {
    return this.songRepository.find({
      relations: { artists: true, playlists: true },
    });
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

  findAllByArtist(artistId: string): Promise<Song[]> {
    return this.songRepository.find({
      where: {
        artists: { id: artistId },
      },
      relations: { artists: true, playlists: true },
    });
  }
  findAllByGenre(genreId: string): Promise<Song[]> {
    return this.songRepository.find({
      where: {
        genres: { id: genreId },
      },
      relations: { artists: true, playlists: true },
    });
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
  async search(query: string): Promise<Song[] | null> {
    const sanitizedQuery = normalizeString(query);

    const allSongs = await this.findAll();
    const filteredSongs = allSongs.filter((song) => {
      const normalizedTitle = normalizeString(song.title);
      return normalizedTitle.includes(sanitizedQuery);
    });
    if (filteredSongs.length > 0) return filteredSongs;
    else return null;

  }

  async searchByArtist(artist: string): Promise<Song[] | null> {
    if (!artist) return [];
    // search for songs in database
    const queryLower = artist.toLowerCase();
    const sanitizedQuery = normalizeString(queryLower);
    const allSongs = await this.findAll();
    const filteredSongs = allSongs.filter((song) => {
      const normalizedArtist = normalizeString(song.artists[0].name);
      return normalizedArtist.includes(sanitizedQuery);
    });
    if (filteredSongs.length > 0) return filteredSongs;
    else return null;
  }

  async findOneByName(title: string): Promise<Song | null> {
    return this.songRepository.findOne({
      where: {
        title
      },
      relations: { artists: true, playlists: true },
    });
  }

  async addArtistToSong(songId: string, artistId: string): Promise<Song | null> {
    const song = await this.songRepository.findOne({
      where: { id: songId },
      relations: { artists: true },
    });

    if (!song) {
      throw new Error("Song not found");
    }

    const artist = await this.artistRepository.findOneBy({ id: artistId });
     if (!artist) {
      throw new Error("Artist not found");
    }

    song.artists.push(artist);
    return this.songRepository.save(song);
  }

  async addGenreToSong(songId: string, genreId: string): Promise<Song | null> {
    const song = await this.songRepository.findOne({
      where: { id: songId },
      relations: { genres: true },
    });

    if (!song) {
      throw new Error("Song not found");
    }

    const genre = await this.genreRepository.findOneBy({ id: genreId });
    if (!genre) {
      throw new Error("Genre not found");
    }

    song.genres.push(genre);
    return this.songRepository.save(song);
  }

  async removeArtistFromSong(songId: string, artistId: string): Promise<Song | null> {
    const song = await this.songRepository.findOne({
      where: { id: songId },
      relations: { artists: true },
    });

    if (!song) {
      throw new Error("Song not found");
    }

    const artist = await this.artistRepository.findOneBy({ id: artistId });
    if (!artist) {
      throw new Error("Artist not found");
    }

    song.artists = song.artists.filter((a) => a.id !== artist.id);
    return this.songRepository.save(song);
  }

  async removeGenreFromSong(songId: string, genreId: string): Promise<Song | null> {
    const song = await this.songRepository.findOne({
      where: { id: songId },
      relations: { genres: true },
    });

    if (!song) {
      throw new Error("Song not found");
    }

    const genre = await this.genreRepository.findOneBy({ id: genreId });
    if (!genre) {
      throw new Error("Genre not found");
    }

    song.genres = song.genres.filter((g) => g.id !== genre.id);
    return this.songRepository.save(song);
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
function sanitizeFileName(title: string): string {
  return title
    .normalize('NFD')                     // Convert to base letters + accents
    .replace(/[\u0300-\u036f]/g, '')     // Remove accents
    .replace(/[^a-zA-Z0-9-_ ]/g, '')     // Remove special characters
    .replace(/\s+/g, '-')                // Replace spaces with hyphens
    .toLowerCase();                      // Optional: lowercase everything
}

function normalizeString(str: string): string {
  return str
    .normalize('NFD')                     // Split letters and accents
    .replace(/[\u0300-\u036f]/g, '')     // Remove accents
    .toLowerCase();                      // Convert to lowercase
}

