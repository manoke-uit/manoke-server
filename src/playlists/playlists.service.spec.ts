import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistsService } from './playlists.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Playlist } from './entities/playlist.entity';
import { Song } from 'src/songs/entities/song.entity';
import { User } from 'src/users/entities/user.entity';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockPlaylistRepository = () => ({
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  findBy: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
});
const mockSongRepository = () => ({
  findOneBy: jest.fn(),
  findBy: jest.fn(),
});
const mockUserRepository = () => ({
  findOneBy: jest.fn(),
});
const mockSupabaseStorageService = () => ({
  uploadPlaylistsImagesFromBuffer: jest.fn(),
});

describe('PlaylistsService', () => {
  let service: PlaylistsService;
  let playlistRepo: any;
  let songRepo: any;
  let userRepo: any;
  let supabaseStorage: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaylistsService,
        { provide: getRepositoryToken(Playlist), useFactory: mockPlaylistRepository },
        { provide: getRepositoryToken(Song), useFactory: mockSongRepository },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: SupabaseStorageService, useFactory: mockSupabaseStorageService },
      ],
    }).compile();

    service = module.get<PlaylistsService>(PlaylistsService);
    playlistRepo = module.get(getRepositoryToken(Playlist));
    songRepo = module.get(getRepositoryToken(Song));
    userRepo = module.get(getRepositoryToken(User));
    supabaseStorage = module.get(SupabaseStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a playlist', async () => {
      playlistRepo.findOne.mockResolvedValue(null);
      userRepo.findOneBy.mockResolvedValue({ id: 'user1' });
      songRepo.findBy.mockResolvedValue([{ id: 'song1' }]);
      playlistRepo.save.mockResolvedValue({ id: 'playlist1', title: 'test', songs: [{ id: 'song1' }] });

      const dto = { title: 'test', userId: 'user1', songIds: ['song1'] };
      const result = await service.create(dto as any);
      expect(result).toHaveProperty('id', 'playlist1');
      expect(playlistRepo.save).toHaveBeenCalled();
    });

    it('should throw if playlist exists', async () => {
      playlistRepo.findOne.mockResolvedValue({ id: 'playlist1' });
      await expect(service.create({ title: 'test', userId: 'user1' } as any)).rejects.toThrow(ConflictException);
    });

    it('should throw if user not found', async () => {
      playlistRepo.findOne.mockResolvedValue(null);
      userRepo.findOneBy.mockResolvedValue(null);
      await expect(service.create({ title: 'test', userId: 'user1' } as any)).rejects.toThrow('User not found');
    });

    it('should upload image if buffer and name provided', async () => {
      playlistRepo.findOne.mockResolvedValue(null);
      userRepo.findOneBy.mockResolvedValue({ id: 'user1' });
      songRepo.findBy.mockResolvedValue([]);
      supabaseStorage.uploadPlaylistsImagesFromBuffer.mockResolvedValue('image-url');
      playlistRepo.save.mockResolvedValue({ id: 'playlist1', imageUrl: 'image-url' });

      const dto = { title: 'test', userId: 'user1' };
      const result = await service.create(dto as any, Buffer.from('test'), 'test.png');
      expect(result.imageUrl).toBe('image-url');
    });
  });

  describe('addSongToPlaylist', () => {
    it('should add a song to playlist', async () => {
      songRepo.findOneBy.mockResolvedValue({ id: 'song1' });
      playlistRepo.findOne.mockResolvedValue({ id: 'playlist1', songs: [] });
      playlistRepo.save.mockResolvedValue({ id: 'playlist1', songs: [{ id: 'song1' }] });
      const result = await service.addSongToPlaylist('playlist1', 'song1');
      expect(result.songs).toHaveLength(1);
    });

    it('should throw if song not found', async () => {
      songRepo.findOneBy.mockResolvedValue(null);
      await expect(service.addSongToPlaylist('playlist1', 'song1')).rejects.toThrow(NotFoundException);
    });

    it('should throw if playlist not found', async () => {
      songRepo.findOneBy.mockResolvedValue({ id: 'song1' });
      playlistRepo.findOne.mockResolvedValue(null);
      await expect(service.addSongToPlaylist('playlist1', 'song1')).rejects.toThrow(NotFoundException);
    });

    it('should throw if song already in playlist', async () => {
      songRepo.findOneBy.mockResolvedValue({ id: 'song1' });
      playlistRepo.findOne.mockResolvedValue({ id: 'playlist1', songs: [{ id: 'song1' }] });
      await expect(service.addSongToPlaylist('playlist1', 'song1')).rejects.toThrow(ConflictException);
    });
  });

  describe('removeSongFromPlaylist', () => {
    it('should remove a song from playlist', async () => {
      playlistRepo.findOne.mockResolvedValue({ id: 'playlist1', songs: [{ id: 'song1' }] });
      playlistRepo.save.mockResolvedValue({ id: 'playlist1', songs: [] });
      const result = await service.removeSongFromPlaylist('playlist1', 'song1');
      expect(result.songs).toHaveLength(0);
    });

    it('should throw if playlist not found', async () => {
      playlistRepo.findOne.mockResolvedValue(null);
      await expect(service.removeSongFromPlaylist('playlist1', 'song1')).rejects.toThrow(NotFoundException);
    });

    it('should throw if song not in playlist', async () => {
      playlistRepo.findOne.mockResolvedValue({ id: 'playlist1', songs: [] });
      await expect(service.removeSongFromPlaylist('playlist1', 'song1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a playlist', async () => {
      playlistRepo.findOne.mockResolvedValue({ id: 'playlist1' });
      const result = await service.findOne('playlist1');
      expect(result).toHaveProperty('id', 'playlist1');
    });
  });

  describe('findAll', () => {
    it('should return all playlists', async () => {
      playlistRepo.find.mockResolvedValue([{ id: 'playlist1' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('remove', () => {
    it('should call delete on repository', async () => {
      playlistRepo.delete.mockResolvedValue({ affected: 1 });
      const result = await service.remove('playlist1');
      expect(result).toHaveProperty('affected', 1);
    });
  });
});
