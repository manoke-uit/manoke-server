import { Injectable } from '@nestjs/common';
import { CreateKaraokeDto } from './dto/create-karaoke.dto';
import { UpdateKaraokeDto } from './dto/update-karaoke.dto';
import { Karaoke, KaraokeStatus } from './entities/karaoke.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Song } from 'src/songs/entities/song.entity';

@Injectable()
export class KaraokesService {
  @InjectRepository(Karaoke)
  private karaokeRepository: Repository<Karaoke>;  
  @InjectRepository(User)
  private userRepository: Repository<User>;
  @InjectRepository(Song)
  private songRepository: Repository<Song>;

  async createByUser(createKaraokeDto: CreateKaraokeDto) : Promise<Karaoke | null> {
    const karaoke = new Karaoke();
    karaoke.description = createKaraokeDto.description;
    karaoke.videoUrl = createKaraokeDto.videoUrl;
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
      return await this.karaokeRepository.save(karaoke);
    } catch (error) {
      console.error('Error creating karaoke:', error);
      return null; // or throw an exception
    }
  }

  async createByAdmin(createKaraokeDto: CreateKaraokeDto) : Promise<Karaoke | null> {
    const karaoke = new Karaoke();
    karaoke.description = createKaraokeDto.description;
    karaoke.videoUrl = createKaraokeDto.videoUrl;
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
      return await this.karaokeRepository.save(karaoke);
    } catch (error) {
      console.error('Error creating karaoke:', error);
      return null; // or throw an exception
    }
  }

  findAll() : Promise<Karaoke[]> {
    return this.karaokeRepository.find({
      relations: ['song', 'user'],
    });
  }

  findOne(id: string) : Promise<Karaoke | null> {
    return this.karaokeRepository.findOne({
      where: { id },
      relations: ['song', 'user'],
    });
  }

  findAllByUserId(userId: string) : Promise<Karaoke[]> {
    return this.karaokeRepository.find({
      where: { user: { id: userId } },
      relations: ['song', 'user'],
    });
  }
  
  findAllBySongId(songId: string) : Promise<Karaoke[]> {
    return this.karaokeRepository.find({
      where: { song: { id: songId } },
      relations: ['song', 'user'],
    });
  }

  update(id: string, updateKaraokeDto: UpdateKaraokeDto) : Promise<UpdateResult>{
    return this.karaokeRepository.update(id, updateKaraokeDto);
  }

  remove(id: string) : Promise<DeleteResult> {
    return this.karaokeRepository.delete(id);
  }

  async findKaraokeAndChangeStatusToPublic(id: string) : Promise<Karaoke | null> {
    return this.karaokeRepository.findOne({
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
    return this.karaokeRepository.findOne({
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
}
