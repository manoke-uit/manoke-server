import { Test, TestingModule } from '@nestjs/testing';
import { KaraokesService } from './karaokes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Karaoke, KaraokeStatus } from './entities/karaoke.entity';
import { User } from 'src/users/entities/user.entity';
import { Song } from 'src/songs/entities/song.entity';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { Repository } from 'typeorm';
import { CreateKaraokeDto } from './dto/create-karaoke.dto';

const mockKaraokeRepository = () => ({
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(),
});
const mockUserRepository = () => ({
  findOneBy: jest.fn(),
});
const mockSongRepository = () => ({
  findOneBy: jest.fn(),
});
const mockSupabaseStorageService = () => ({
  uploadVideoFromBuffer: jest.fn(),
});

describe('KaraokesService', () => {
  let service: KaraokesService;
  let karaokeRepo: jest.Mocked<Repository<Karaoke>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let songRepo: jest.Mocked<Repository<Song>>;
  let supabaseStorage: jest.Mocked<SupabaseStorageService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KaraokesService,
        { provide: getRepositoryToken(Karaoke), useFactory: mockKaraokeRepository },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: getRepositoryToken(Song), useFactory: mockSongRepository },
        { provide: SupabaseStorageService, useFactory: mockSupabaseStorageService },
      ],
    }).compile();

    service = module.get<KaraokesService>(KaraokesService);
    karaokeRepo = module.get(getRepositoryToken(Karaoke));
    userRepo = module.get(getRepositoryToken(User));
    songRepo = module.get(getRepositoryToken(Song));
    supabaseStorage = module.get(SupabaseStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createByUser', () => {
    it('should create a karaoke and return it', async () => {
      const dto: CreateKaraokeDto = {
        description: 'desc',
        videoUrl: 'http://video',
        createdAt: '2024-01-01',
        songId: 'song1',
        userId: 'user1',
      };
      const fileBuffer = Buffer.from('test');
      const fileName = 'video.mp4';
      const song = { id: 'song1' } as Song;
      const user = { id: 'user1' } as User;
      const karaoke = { id: 'karaoke1', description: dto.description, videoUrl: 'url', song, user } as Karaoke;

      supabaseStorage.uploadVideoFromBuffer.mockResolvedValue('url');
      songRepo.findOneBy.mockResolvedValue(song);
      userRepo.findOneBy.mockResolvedValue(user);
      karaokeRepo.save.mockResolvedValue({
        id: 'karaoke1',
        description: dto.description,
        videoUrl: 'url',
        status: KaraokeStatus.PRIVATE,
        createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
        song,
        user,
      });
      karaokeRepo.findOne.mockResolvedValue(karaoke);

      const result = await service.createByUser(fileBuffer, fileName, dto);
      expect(result).toEqual(karaoke);
      expect(supabaseStorage.uploadVideoFromBuffer).toHaveBeenCalled();
      expect(songRepo.findOneBy).toHaveBeenCalledWith({ id: dto.songId });
      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: dto.userId });
      expect(karaokeRepo.save).toHaveBeenCalled();
    });

    it('should return null if song not found', async () => {
      const dto: CreateKaraokeDto = {
        description: 'desc',
        videoUrl: 'http://video',
        createdAt: '2024-01-01',
        songId: 'song1',
        userId: 'user1',
      };
      supabaseStorage.uploadVideoFromBuffer.mockResolvedValue('url');
      songRepo.findOneBy.mockResolvedValue(null);

      const result = await service.createByUser(Buffer.from(''), 'file', dto);
      expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
      const dto: CreateKaraokeDto = {
        description: 'desc',
        videoUrl: 'http://video',
        createdAt: '2024-01-01',
        songId: 'song1',
        userId: 'user1',
      };
      supabaseStorage.uploadVideoFromBuffer.mockResolvedValue('url');
      songRepo.findOneBy.mockResolvedValue({ id: 'song1' } as Song);
      userRepo.findOneBy.mockResolvedValue(null);

      const result = await service.createByUser(Buffer.from(''), 'file', dto);
      expect(result).toBeNull();
    });

    it('should throw if video upload fails', async () => {
      const dto: CreateKaraokeDto = {
        description: 'desc',
        videoUrl: 'http://video',
        createdAt: '2024-01-01',
        songId: 'song1',
        userId: 'user1',
      };
      supabaseStorage.uploadVideoFromBuffer.mockResolvedValue(null);

      await expect(service.createByUser(Buffer.from(''), 'file', dto)).rejects.toThrow('Video upload failed');
    });
  });

  describe('findAll', () => {
    it('should return all karaokes', async () => {
      const karaokes = [{ id: '1' } as Karaoke];
      karaokeRepo.find.mockResolvedValue(karaokes);
      const result = await service.findAll();
      expect(result).toEqual(karaokes);
      expect(karaokeRepo.find).toHaveBeenCalledWith({ relations: ['song', 'user'] });
    });
  });

  describe('findOne', () => {
    it('should return a karaoke by id', async () => {
      const karaoke = { id: '1' } as Karaoke;
      karaokeRepo.findOne.mockResolvedValue(karaoke);
      const result = await service.findOne('1');
      expect(result).toEqual(karaoke);
      expect(karaokeRepo.findOne).toHaveBeenCalledWith({ where: { id: '1' }, relations: ['song', 'user'] });
    });
  });

  describe('remove', () => {
    it('should call delete on repository', async () => {
      karaokeRepo.delete.mockResolvedValue({ affected: 1, raw: {} }); // Thêm raw: {}
      const result = await service.remove('1');
      expect(result).toEqual({ affected: 1, raw: {} });
      expect(karaokeRepo.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('findKaraokeAndChangeStatusToPublic', () => {
    it('should change status to PUBLIC', async () => {
      const karaoke = { id: '1', status: KaraokeStatus.PRIVATE } as Karaoke;
      karaokeRepo.findOne.mockResolvedValue(karaoke);
      karaokeRepo.save.mockResolvedValue({ ...karaoke, status: KaraokeStatus.PUBLIC });
      const result = await service.findKaraokeAndChangeStatusToPublic('1');
      expect(result).toEqual({ ...karaoke, status: KaraokeStatus.PUBLIC });
    });

    it('should return null if karaoke not found', async () => {
      karaokeRepo.findOne.mockResolvedValue(null);
      const result = await service.findKaraokeAndChangeStatusToPublic('1');
      expect(result).toBeNull();
    });
  });
});
