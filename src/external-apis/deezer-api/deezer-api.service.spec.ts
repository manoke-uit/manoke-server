import { Test, TestingModule } from '@nestjs/testing';
import { DeezerApiService } from './deezer-api.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('axios');
jest.mock('fs');

describe('DeezerApiService', () => {
  let service: DeezerApiService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeezerApiService,
        {
          provide: HttpService,
          useValue: {
            head: jest.fn(),
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('https://api.deezer.com'),
          },
        },
      ],
    }).compile();

    service = module.get<DeezerApiService>(DeezerApiService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isDeezerPreviewValid', () => {
    it('should return true if status is 200', async () => {
      (httpService.head as jest.Mock).mockReturnValue(of({ status: 200 }));
      const result = await service.isDeezerPreviewValid('https://preview.url');
      expect(result).toBe(true);
    });

    it('should return false if request fails', async () => {
      (httpService.head as jest.Mock).mockReturnValue(throwError(() => new Error('fail')));
      const result = await service.isDeezerPreviewValid('https://preview.url');
      expect(result).toBe(false);
    });
  });

  describe('getDeezerPreviewUrl', () => {
    it('should return first track if found', async () => {
      const mockTrack = { preview: 'url', id: 1 };
      (httpService.get as jest.Mock).mockReturnValue(of({ data: { data: [mockTrack] } }));
      const result = await service.getDeezerPreviewUrl('Song', 'Artist');
      expect(result).toEqual(mockTrack);
    });

    it('should return null if no track found', async () => {
      (httpService.get as jest.Mock).mockReturnValue(of({ data: { data: [] } }));
      const result = await service.getDeezerPreviewUrl('Song', 'Artist');
      expect(result).toBeNull();
    });

    it('should throw error if request fails', async () => {
      (httpService.get as jest.Mock).mockReturnValue(throwError(() => new Error('fail')));
      await expect(service.getDeezerPreviewUrl('Song', 'Artist')).rejects.toThrow('Failed to fetch Deezer preview URL');
    });
  });

 describe('downloadDeezerPreview', () => {
    it('should download and save preview file', async () => {
      const mockStream = { pipe: jest.fn() };
      const mockWriter = {
        on: jest.fn((event, cb) => {
          if (event === 'finish') setTimeout(cb, 0);
          return mockWriter;
        }),
      };
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
      (fs.createWriteStream as jest.Mock).mockReturnValue(mockWriter);
      (axios.get as jest.Mock).mockResolvedValue({ data: mockStream });

      const result = await service.downloadDeezerPreview('http://preview.url');
      expect(result).toContain('temp');
      expect(result).toMatch(/\.mp3$/); 
      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.createWriteStream).toHaveBeenCalled();
      expect(mockStream.pipe).toHaveBeenCalledWith(mockWriter);
    });

    it('should reject if writer emits error', async () => {
      const mockStream = { pipe: jest.fn() };
      const mockWriter = {
        on: jest.fn((event, cb) => {
          if (event === 'error') setTimeout(() => cb(new Error('write error')), 0);
          return mockWriter;
        }),
      };
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.createWriteStream as jest.Mock).mockReturnValue(mockWriter);
      (axios.get as jest.Mock).mockResolvedValue({ data: mockStream });

      await expect(service.downloadDeezerPreview('http://preview.url')).rejects.toThrow('write error');
    });
  });
});