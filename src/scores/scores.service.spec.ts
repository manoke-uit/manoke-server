import { Test, TestingModule } from '@nestjs/testing';
import { ScoresService } from './scores.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Score } from './entities/score.entity';
import { SongsService } from '../songs/songs.service';
import { HttpService } from '@nestjs/axios';
import { SupabaseStorageService } from '../supabase-storage/supabase-storage.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { AudioService } from '../helpers/audio/audio.service';
import { Repository } from 'typeorm';

describe('ScoresService', () => {
  let service: ScoresService;
  let scoreRepository: Repository<Score>;
  let songsService: SongsService;
  let usersService: UsersService;
  let supabaseStorageService: SupabaseStorageService;
  let audioService: AudioService;

  beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ScoresService,
      {
        provide: getRepositoryToken(Score),
        useValue: {
          save: jest.fn(),
          find: jest.fn(),
        },
      },
      { provide: SongsService, useValue: { findOne: jest.fn() } },
      { provide: HttpService, useValue: {} },
      { 
        provide: SupabaseStorageService, 
        useValue: { 
          uploadRecordingFromBuffer: jest.fn().mockResolvedValue('https://fake.url/audio.wav') 
        } 
      },
      { provide: UsersService, useValue: { findOne: jest.fn() } },
      { provide: ConfigService, useValue: { get: jest.fn() } },
      { provide: AudioService, useValue: {
        convertM4aToWav: jest.fn(),
        fetchBufferFromUrl: jest.fn(),
        splitAudioFile: jest.fn(),
        getDurationFromBuffer: jest.fn(),
        comparePitch: jest.fn(),
        compareLyrics: jest.fn(),
      }},
    ],
  }).compile();

    service = module.get<ScoresService>(ScoresService);
    scoreRepository = module.get<Repository<Score>>(getRepositoryToken(Score));
    songsService = module.get<SongsService>(SongsService);
    usersService = module.get<UsersService>(UsersService);
    supabaseStorageService = module.get<SupabaseStorageService>(SupabaseStorageService);
    audioService = module.get<AudioService>(AudioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllForAdmin', () => {
    it('should return all scores with relations', async () => {
      const mockScores = [{ id: '1' }, { id: '2' }];
      (scoreRepository.find as jest.Mock).mockResolvedValue(mockScores);
      const result = await service.findAllForAdmin();
      expect(result).toEqual(mockScores);
      expect(scoreRepository.find).toHaveBeenCalledWith({ relations: ['song', 'user'] });
    });
  });

  describe('findAll', () => {
    it('should return all scores for a user', async () => {
      const mockScores = [{ id: '1' }];
      (scoreRepository.find as jest.Mock).mockResolvedValue(mockScores);
      const result = await service.findAll('user-1');
      expect(result).toEqual(mockScores);
      expect(scoreRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 'user-1' } },
        relations: ['song'],
      });
    });
  });

  describe('create', () => {
    it('should create and save a score', async () => {
      const createScoreDto = { userId: 'user-1', songId: 'song-1', finalScore: 90 };
      const buffer = Buffer.from('audio');
      const user = { id: 'user-1' };
      const song = { id: 'song-1' };
      (usersService.findOne as jest.Mock).mockResolvedValue(user);
      (songsService.findOne as jest.Mock).mockResolvedValue(song);
      (scoreRepository.save as jest.Mock).mockImplementation(async (score) => score);

      const result = await service.create(createScoreDto as any, buffer);
      expect(result.user).toEqual(user);
      expect(result.song).toEqual(song);
      expect(scoreRepository.save).toHaveBeenCalled();
    });
  });
});