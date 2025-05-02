import { Injectable } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Playlist } from './entities/playlist.entity';
import { DeleteResult, In, Repository, UpdateResult } from 'typeorm';
import { Song } from 'src/songs/entities/song.entity';
import { User } from 'src/users/entities/user.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>, 
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createPlaylistDto: CreatePlaylistDto): Promise<Playlist> {
    const playlist = new Playlist();
    playlist.title = createPlaylistDto.title; 
    playlist.imageUrl = createPlaylistDto.imageUrl; 
    playlist.description = createPlaylistDto.description; 

    const user = await this.userRepository.findOneBy({ id: createPlaylistDto.userId });
    if (!user)
      throw new Error("User not found");

    playlist.user = user;

    if (createPlaylistDto.songIds && createPlaylistDto.songIds.length > 0) {
      const songs = await this.songRepository.findBy({
        id: In(createPlaylistDto.songIds),
      });
      playlist.songs = songs;
    } else {
      playlist.songs = [];
    }

    return this.playlistRepository.save(playlist);
  }

  async createFavouritePlaylist(email: string): Promise<Playlist> {
    const user = await this.userRepository.findOneBy({email});

    if (!user)
      throw new Error("User not found");
    
    const favPlaylist = new Playlist();
    favPlaylist.title = "Favourite Playlist";
    favPlaylist.user = user;
    favPlaylist.imageUrl = "", 
    favPlaylist.description = "",
    favPlaylist.songs = [];

    return this.playlistRepository.save(favPlaylist);
  }

  findAll() {
    return this.playlistRepository.find();
  }

  findOne(id: string): Promise<Playlist | null> {
    return this.playlistRepository.findOneBy({ id });
  }

  async update(id: string, updatePlaylistDto: UpdatePlaylistDto) : Promise<UpdateResult> {
    return this.playlistRepository.update(id, updatePlaylistDto);
  }

  remove(id: string): Promise<DeleteResult> {
    return this.playlistRepository.delete(id);
  }

  paginate(options: IPaginationOptions): Promise<Pagination<Playlist>> {
    return paginate<Playlist>(this.playlistRepository, options);
  }
}
