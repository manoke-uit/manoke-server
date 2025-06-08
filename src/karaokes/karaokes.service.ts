import { Injectable } from '@nestjs/common';
import { CreateKaraokeDto } from './dto/create-karaoke.dto';
import { UpdateKaraokeDto } from './dto/update-karaoke.dto';
import { Karaoke, KaraokeStatus } from './entities/karaoke.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Song } from 'src/songs/entities/song.entity';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';

@Injectable()
export class KaraokesService {
  @InjectRepository(Karaoke)
  private karaokeRepository: Repository<Karaoke>;  
  @InjectRepository(User)
  private userRepository: Repository<User>;
  @InjectRepository(Song)
  private songRepository: Repository<Song>;
  constructor(private readonly supabaseStorageService: SupabaseStorageService) {}

  async createByUser(fileBuffer : Buffer, fileName: string, createKaraokeDto: CreateKaraokeDto) : Promise<Karaoke | null> {
    const karaoke = new Karaoke();
    karaoke.description = createKaraokeDto.description;

    const uploadedVideo = await this.supabaseStorageService.uploadVideoFromBuffer(fileBuffer, sanitizeFileName(fileName));
    if (!uploadedVideo) {
      throw new Error('Video upload failed');
    }
    karaoke.videoUrl = uploadedVideo || ""; // set the videoUrl in the karaoke

    if (createKaraokeDto.createdAt) {
      karaoke.createdAt = new Date(createKaraokeDto.createdAt);
    }
    if(createKaraokeDto.songId) {
      const song = await this.songRepository.findOneBy({ id: createKaraokeDto.songId });
      if (!song) {
        console.error('Song not found');
        return null; // or throw an exception
      }
      karaoke.song = song;
    }
    if (createKaraokeDto.userId) {
      const user = await this.userRepository.findOneBy({ id: createKaraokeDto.userId });
      if (!user) {
        console.error('User not found');
        return null; // or throw an exception
      }
      karaoke.user = user;
    }
    try {
      const savedKaraoke = await this.karaokeRepository.save(karaoke);
      return await this.karaokeRepository.findOne({
        where: { id: savedKaraoke.id },
        relations: ['song', 'user'],
      });
    } catch (error) {
      console.error('Error creating karaoke:', error);
      return null; // or throw an exception
    }
  }

  async createByAdmin(fileBuffer : Buffer, fileName: string, createKaraokeDto: CreateKaraokeDto) : Promise<Karaoke | null> {
    const karaoke = new Karaoke();
    karaoke.description = createKaraokeDto.description;

    const uploadedVideo = await this.supabaseStorageService.uploadVideoFromBuffer(fileBuffer, sanitizeFileName(fileName));
    if (!uploadedVideo) {
      throw new Error('Video upload failed');
    }
    karaoke.videoUrl = uploadedVideo || ""; // set the videoUrl in the karaoke
    
    if (createKaraokeDto.createdAt) {
      karaoke.createdAt = new Date(createKaraokeDto.createdAt);
    }
    // admin can create public karaoke
    karaoke.status = KaraokeStatus.PUBLIC;
    if(createKaraokeDto.songId) {
      const song = await this.songRepository.findOneBy({ id: createKaraokeDto.songId });
      if (!song) {
        console.error('Song not found');
        return null; // or throw an exception
      }
      karaoke.song = song;
    }
    if (createKaraokeDto.userId) {
      const user = await this.userRepository.findOneBy({ id: createKaraokeDto.userId });
      if (!user) {
        console.error('User not found');
        return null; // or throw an exception
      }
      karaoke.user = user;
    }
    try {
      const savedKaraoke = await this.karaokeRepository.save(karaoke);
      // After saving, fetch the saved karaoke with relations
      return await this.karaokeRepository.findOne({
        where: { id: savedKaraoke.id },
        relations: ['song', 'user'],
      });

    } catch (error) {
      console.error('Error creating karaoke:', error);
      return null; // or throw an exception
    }
  }

  async findAll() : Promise<Karaoke[]> {
    return await this.karaokeRepository.find({
      relations: ['song', 'user'],
    });
  }

  async findOne(id: string) : Promise<Karaoke | null> {
    return  await this.karaokeRepository.findOne({
      where: { id },
      relations: ['song', 'user'],
    });
  }

  async findAllByUserId(userId: string) : Promise<Karaoke[]> {
    return await this.karaokeRepository.find({
      where: { user: { id: userId } },
      relations: ['song', 'user'],
    });
  }
  
  async findAllBySongId(songId: string) : Promise<Karaoke[]> {
    return await this.karaokeRepository.find({
      where: { song: { id: songId } },
      relations: ['song', 'user'],
    });
  }

  async update(id: string, userId: string,updateKaraokeDto: UpdateKaraokeDto, fileBuffer?: Buffer, fileName?: string ){
    const karaoke = await this.karaokeRepository.findOneBy({ id });
    if (!karaoke) {
      throw new Error('Karaoke not found');
    }
    karaoke.videoUrl = updateKaraokeDto.videoUrl ?? karaoke.videoUrl;
    karaoke.description = updateKaraokeDto.description ?? karaoke.description;
    
    if (updateKaraokeDto.songId) {
      const song = await this.songRepository.findOneBy({ id: updateKaraokeDto.songId });
      if (!song) {
        throw new Error('Song not found');
      }
      karaoke.song = song;
    }
    if (updateKaraokeDto.userId) {
      const user = await this.userRepository.findOneBy({ id: updateKaraokeDto.userId });
      if (!user) {
        throw new Error('User not found');
      }
      karaoke.user = user;
    } else {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new Error('User not found');
      }
      karaoke.user = user;
    }
    if (fileBuffer && fileName) {
      const uploadedVideo = await this.supabaseStorageService.uploadVideoFromBuffer(fileBuffer, sanitizeFileName(fileName));
      if (!uploadedVideo) {
        throw new Error('Video upload failed');
      }
      karaoke.videoUrl = uploadedVideo; // Update the videoUrl with the new uploaded video
    }
    karaoke.status = updateKaraokeDto.status ?? karaoke.status; // Update status if provided, otherwise keep the current status
    const updatedKaraoke = await this.karaokeRepository.save(karaoke);
    return await this.karaokeRepository.findOne({
      where: { id: updatedKaraoke.id },
      relations: ['song', 'user'],
    });

  }

  remove(id: string) : Promise<DeleteResult> {
    return this.karaokeRepository.delete(id);
  }

  async findKaraokeAndChangeStatusToPublic(id: string) : Promise<Karaoke | null> {
    return await this.karaokeRepository.findOne({
      where: { id },
      relations: ['song', 'user'],
    }).then(karaoke => {
      if (karaoke) {
        karaoke.status = KaraokeStatus.PUBLIC;
        return this.karaokeRepository.save(karaoke);
      }
      return null;
    });
  }

  async findKaraokeAndChangeStatusToPending(id: string) : Promise<Karaoke | null> {
    return await this.karaokeRepository.findOne({
      where: { id },
      relations: ['song', 'user'],
    }).then(karaoke => {
      if (karaoke) {
        karaoke.status = KaraokeStatus.PENDING;
        return this.karaokeRepository.save(karaoke);
      }
      return null;
    });
  }

  async findKaraokeAndChangeStatusToPrivate(id: string) : Promise<Karaoke | null> {
    return await this.karaokeRepository.findOne({
      where: { id },
      relations: ['song', 'user'],
    }).then(karaoke => {
      if (karaoke) {
        karaoke.status = KaraokeStatus.PRIVATE;
        return this.karaokeRepository.save(karaoke);
      }
      return null;
    });
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