import { Test, TestingModule } from '@nestjs/testing';
import { SongsService } from './songs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Song } from './entities/song.entity';
import { Artist } from 'src/artists/entities/artist.entity';
import { Playlist } from 'src/playlists/entities/playlist.entity';
import { Genre } from 'src/genres/entities/genre.entity';
import { Karaoke } from 'src/karaokes/entities/karaoke.entity';
import { AudioService } from 'src/helpers/audio/audio.service';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';

class MockAudioService {
  getDurationFromBuffer = jest.fn().mockResolvedValue(35);
  splitAudioFile = jest.fn().mockResolvedValue([Buffer.from('audio')]);
}
class MockSupabaseStorageService {
  uploadSnippetFromBuffer = jest.fn().mockResolvedValue('http://audio.url');
  uploadSongImageFromBuffer = jest.fn().mockResolvedValue('http://image.url');
}

describe('SongsService', () => {
  let service: SongsService;
  let songRepository: any;
  let artistRepository: any;
  let playlistRepository: any;
  let genreRepository: any;
  let karaokeRepository: any;
  let audioService: MockAudioService;

  const mockSong = {
    id: '1',
    title: 'Song 1',
    lyrics: 'lyrics',
    songUrl: 'http://audio.url',
    imageUrl: 'http://image.url',
    artists: [],
    playlists: [],
    genres: [],
  };

  beforeEach(async () => {
    songRepository = {
      save: jest.fn().mockResolvedValue(mockSong),
      find: jest.fn().mockResolvedValue([mockSong]),
      findOne: jest.fn().mockResolvedValue(mockSong),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    artistRepository = { findBy: jest.fn(), findOneBy: jest.fn(), save: jest.fn() };
    playlistRepository = { findBy: jest.fn(), save: jest.fn() };
    genreRepository = { findBy: jest.fn(), findOneBy: jest.fn(), save: jest.fn() };
    karaokeRepository = { findOne: jest.fn(), save: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SongsService,
        { provide: getRepositoryToken(Song), useValue: songRepository },
        { provide: getRepositoryToken(Artist), useValue: artistRepository },
        { provide: getRepositoryToken(Playlist), useValue: playlistRepository },
        { provide: getRepositoryToken(Genre), useValue: genreRepository },
        { provide: getRepositoryToken(Karaoke), useValue: karaokeRepository },
        { provide: AudioService, useClass: MockAudioService },
        { provide: SupabaseStorageService, useClass: MockSupabaseStorageService },
      ],
    }).compile();

    service = module.get<SongsService>(SongsService);
    audioService = module.get<AudioService>(AudioService) as any;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all songs', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockSong]);
      expect(songRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a song by id', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual(mockSong);
      expect(songRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: { artists: true, playlists: true, genres: true },
      });
    });
    it('should return null if song not found', async () => {
      songRepository.findOne.mockResolvedValue(null);
      const result = await service.findOne('2');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a song and return it', async () => {
      const dto = { title: 'Song 1', lyrics: 'lyrics', songUrl: '', artistIds: [], playlistIds: [], genreIds: [] };
      const buffer = Buffer.from('audio');
      const result = await service.create(buffer, 'audio.wav', dto as any);
      expect(result).toEqual(mockSong);
      expect(songRepository.save).toHaveBeenCalled();
    });

    it('should throw error if audio too short', async () => {
      audioService.getDurationFromBuffer.mockResolvedValue(10);
      const dto = { title: 'Song 1', lyrics: 'lyrics', songUrl: '' };
      await expect(service.create(Buffer.from('audio'), 'audio.wav', dto as any)).rejects.toThrow('Audio length must be at least 30 seconds.');
    });
  });

  describe('update', () => {
    it('should update a song and return it', async () => {
      const dto = { title: 'Song 1', lyrics: 'new lyrics', artistIds: [], playlistIds: [], genreIds: [] };
      const result = await service.update('1', dto as any);
      expect(result).toEqual(mockSong);
      expect(songRepository.save).toHaveBeenCalled();
    });

    it('should throw error if song not found', async () => {
      songRepository.findOne.mockResolvedValue(null);
      await expect(service.update('2', {} as any)).rejects.toThrow('Song not found');
    });
  });

  describe('remove', () => {
    it('should remove a song', async () => {
      const result = await service.remove('1');
      expect(result).toEqual({ affected: 1 });
      expect(songRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error if song not found', async () => {
      songRepository.findOne.mockResolvedValue(null);
      await expect(service.remove('2')).rejects.toThrow('Song not found');
    });
  });
});