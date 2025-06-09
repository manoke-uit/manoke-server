import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Playlist } from './entities/playlist.entity';
import { DeleteResult, ILike, In, Repository, UpdateResult } from 'typeorm';
import { Song } from 'src/songs/entities/song.entity';
import { User } from 'src/users/entities/user.entity';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>, 
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly supabaseStorageService: SupabaseStorageService, // Assuming you have a service to handle image uploads
  ) {}

  
  async create(createPlaylistDto: CreatePlaylistDto, imageBuffer?: Buffer, imageName?: string): Promise<Playlist> {
    const existingPlaylist = await this.playlistRepository.findOne({
      where: { title: createPlaylistDto.title, user: { id: createPlaylistDto.userId } },
      relations: ['user'],
    });
    if (existingPlaylist) {
      throw new ConflictException("Playlist title already exists!");
    }

    const playlist = new Playlist();
    playlist.title = createPlaylistDto.title; 
    playlist.description = createPlaylistDto.description ?? ""; 
    playlist.isPublic = !createPlaylistDto.isPublic ? false :  true;

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

    if (imageBuffer && imageName) {
      // Assuming you have a service to handle image uploads
      const uploadedImage = await this.supabaseStorageService.uploadPlaylistsImagesFromBuffer(imageBuffer, sanitizeFileName(imageName));
      if (!uploadedImage) {
        throw new Error('Image upload failed');
      }
      playlist.imageUrl = uploadedImage; // Set the image URL or path
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

  // async addSongToPlaylist(playlistId: string, songId: string) {
  //   const song = await this.songRepository.findOneBy({id: songId});
  //   if (!song) {
  //     throw new NotFoundException("Song doesn't exist!");
  //   }

  //   const playlist = await this.playlistRepository.findOne({
  //     where: {id: playlistId}, 
  //     relations: ['songs']
  //   });
  //   if (!playlist) {
  //     throw new NotFoundException("Playlist doesn't exist!");
  //   }

  //   const songAlreadyInPlaylist = playlist.songs.some(existingSong => existingSong.id === songId);
  //   if (songAlreadyInPlaylist) {
  //     throw new ConflictException("Song already exists in the playlist!");
  //   }

  //   playlist.songs.push(song);
  //   return await this.playlistRepository.save(playlist);
  // }

  async addSongToFavouritePlaylist(title: string, songId: string) {
    const song = await this.songRepository.findOneBy({id: songId});
    if (!song) {
      throw new NotFoundException("Song doesn't exist!");
    }

    const favPlaylist = await this.playlistRepository.findOne({
      where: {title}, 
      relations: ['songs']
    });
    if (!favPlaylist) {
      throw new NotFoundException("Playlist doesn't exist!");
    }

    const songAlreadyInPlaylist = favPlaylist.songs.some(existingSong => {
      if (existingSong.id === songId) {
        console.log(existingSong.id)
        console.log(songId)
        return existingSong.id === songId;
      }
    });

    if (songAlreadyInPlaylist) {
      throw new ConflictException("Song already exists in the playlist!");
    }

    favPlaylist.songs.push(song);
    return await this.playlistRepository.save(favPlaylist);
  }

  async getFavouriteSongs(title: string): Promise<Song[]> {
    const favPlaylist = await this.playlistRepository.findOne({
      where: {title}, 
      relations: ['songs']
    });

    if (!favPlaylist) {
      throw new NotFoundException("Playlist doesn't exist!");
    }

    return favPlaylist.songs;
  }

  async getSongsInPlaylist(playlistId: string): Promise<Song[]> {
    const playlist = await this.playlistRepository.findOne({
      where: {id: playlistId}, 
      relations: ['songs']
    });

    if (!playlist) {
      throw new NotFoundException("Playlist doesn't exist!");
    }

    return playlist.songs;
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<Playlist> {
    // Tìm playlist theo ID
    const playlist = await this.playlistRepository.findOne({
      where: { id: playlistId },
      relations: ['songs']
    });
  
    if (!playlist) {
      throw new NotFoundException("Playlist doesn't exist!");
    }
  
    const songIndex = playlist.songs.findIndex(song => song.id === songId);
    
    if (songIndex === -1) {
      throw new NotFoundException("Song not found in this playlist!");
    }
  
    playlist.songs.splice(songIndex, 1);
  
    return this.playlistRepository.save(playlist);
  }
  
  async removeSongFromFavouritePlaylist(title: string, songId: string): Promise<Playlist> {
    const favPlaylist = await this.playlistRepository.findOne({
      where: { title },
      relations: ['songs']
    });
  
    if (!favPlaylist) {
      throw new NotFoundException("Playlist doesn't exist!");
    }
  
    const songIndex = favPlaylist.songs.findIndex(song => song.id === songId);
  
    if (songIndex === -1) {
      throw new NotFoundException("Song not found in this playlist!");
    }
  
    favPlaylist.songs.splice(songIndex, 1);
  
    return this.playlistRepository.save(favPlaylist);
  }

  async clonePlaylist(userId: string, playlistId: string) {
    const playlistToClone = await this.playlistRepository.findOne({
      where: { id: playlistId },
      relations: ['user', 'songs']
    });

    const userWantToClone = await this.userRepository.findOneBy({id: userId});
    
    if (!playlistToClone) {
      throw new NotFoundException('Cannot get playlist')
    }

    if (!userWantToClone) {
      throw new NotFoundException('Cannot find user!');
    }

    const clonedPlaylist = this.playlistRepository.create({
      ...playlistToClone, 
      isPublic: false,
      id: undefined, 
      user: userWantToClone, 
      title: `${playlistToClone.title} (Clone)`, 
    });

    return this.playlistRepository.save(clonedPlaylist);
  }

  async searchPlaylist(titleSearch: string) {
    const playlists = await this.playlistRepository.find({
      where: {title: ILike(`%${titleSearch}%`)}
    });
    
    return playlists;
  }
  

  async findAll() {
    return await this.playlistRepository.find({
      relations: ['user', 'songs'],
    });
  }

  async findPublicPlaylist() {
    return await this.playlistRepository.find({
      where: {isPublic: true}
    });
  }

  async findUserPlaylist(userId: string) {
    const user = await this.userRepository.findOneBy({id: userId});

    if (!user) {
      throw new NotFoundException('Cannot get user!')
    }

    return await this.playlistRepository.find({
      where: {user}
    })
  }

  async findOne(id: string): Promise<Playlist | null> {
    return await this.playlistRepository.findOne({
      where: { id },
      relations: ['user', 'songs'],
    })
  }

  async update(id: string, userId: string, updatePlaylistDto: UpdatePlaylistDto, imageBuffer?: Buffer, imageName?: string): Promise<Playlist> {
    const playlist = await this.playlistRepository.findOneBy({ id });
    if (!playlist) {
      throw new NotFoundException("Playlist doesn't exist!");
    }
    playlist.title = updatePlaylistDto.title  ?? playlist.title;
    playlist.description = updatePlaylistDto.description ?? playlist.description;
    playlist.isPublic = updatePlaylistDto.isPublic?? playlist.isPublic;
    playlist.songs = updatePlaylistDto.songIds ? await this.songRepository.findBy({id: In(updatePlaylistDto.songIds)}) : playlist.songs;
    if (updatePlaylistDto.userId){
      const user = await this.userRepository.findOneBy({id: updatePlaylistDto.userId});
      if (!user) {
        throw new NotFoundException("User doesn't exist!");
      }
      playlist.user = user;
    } else {
      const user = await this.userRepository.findOneBy({id: userId});
      if (!user) {
        throw new NotFoundException("User doesn't exist!");
      }
      playlist.user = user;
    }
    if (imageBuffer && imageName) {
      const uploadedImage = await this.supabaseStorageService.uploadPlaylistsImagesFromBuffer(imageBuffer, sanitizeFileName(imageName));
      if (!uploadedImage) {
        throw new Error('Image upload failed');
      }
      playlist.imageUrl = uploadedImage; // Set the image URL or path
    }
    return await this.playlistRepository.save(playlist);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.playlistRepository.delete(id);
  }

  async findByTitle(title: string): Promise<Playlist | null> {
    return await this.playlistRepository.findOne({
      where: { title },
      relations: ['songs'],
    });
  }

  paginate(options: IPaginationOptions): Promise<Pagination<Playlist>> {
    return paginate<Playlist>(this.playlistRepository, options);
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