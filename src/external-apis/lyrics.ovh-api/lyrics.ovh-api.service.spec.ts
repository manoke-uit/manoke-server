import { Test, TestingModule } from '@nestjs/testing';
import { LyricsOvhApiService } from './lyrics.ovh-api.service';
import { ConfigService } from '@nestjs/config';

describe('LyricsOvhApiService', () => {
  let service: LyricsOvhApiService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LyricsOvhApiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('https://api.lyrics.ovh/v1'),
          },
        },
      ],
    }).compile();

    service = module.get<LyricsOvhApiService>(LyricsOvhApiService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return lyrics when API responds with lyrics', async () => {
    const mockLyrics = 'Hello, is it me you\'re looking for?';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ lyrics: mockLyrics }),
    }) as any;

    const result = await service.getLyrics('Hello', 'Adele');
    expect(result).toBe(mockLyrics);
    expect(fetch).toHaveBeenCalledWith('https://api.lyrics.ovh/v1/Adele/Hello');
  });

  it('should return empty string if API responds without lyrics', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as any;

    const result = await service.getLyrics('NoLyrics', 'Unknown');
    expect(result).toBe('');
  });

  it('should return empty string if API responds with error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    }) as any;

    const result = await service.getLyrics('NotFound', 'Nobody');
    expect(result).toBe('');
  });

  it('should throw error if fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as any;
    await expect(service.getLyrics('Error', 'Error')).rejects.toThrow('Network error');
  });
});