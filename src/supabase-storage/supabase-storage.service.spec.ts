import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseStorageService } from './supabase-storage.service';
import { ConfigService } from '@nestjs/config';

const mockSupabaseClient = {
  storage: {
    from: jest.fn().mockReturnThis(),
    upload: jest.fn(),
    getPublicUrl: jest.fn(),
  },
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('SupabaseStorageService', () => {
  let service: SupabaseStorageService;
  let configService: ConfigService;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockReturnValue('test'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseStorageService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<SupabaseStorageService>(SupabaseStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadSnippetFromBuffer', () => {
    it('should return public url if upload success', async () => {
      mockSupabaseClient.storage.upload.mockResolvedValue({ data: {}, error: null });
      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({ data: { publicUrl: 'http://test.url' } });

      const result = await service.uploadSnippetFromBuffer(Buffer.from('test'), 'test.mp3');
      expect(result).toBe('http://test.url');
    });

    it('should return null if upload failed', async () => {
      mockSupabaseClient.storage.upload.mockResolvedValue({ data: null, error: { message: 'fail' } });
      const result = await service.uploadSnippetFromBuffer(Buffer.from('test'), 'test.mp3');
      expect(result).toBeNull();
    });
  });

  describe('uploadRecordingFromBuffer', () => {
    it('should return public url if upload success', async () => {
      mockSupabaseClient.storage.upload.mockResolvedValue({ data: {}, error: null });
      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({ data: { publicUrl: 'http://test.url' } });

      const result = await service.uploadRecordingFromBuffer(Buffer.from('test'), 'test.mp3');
      expect(result).toBe('http://test.url');
    });

    it('should return null if upload failed', async () => {
      mockSupabaseClient.storage.upload.mockResolvedValue({ data: null, error: { message: 'fail' } });
      const result = await service.uploadRecordingFromBuffer(Buffer.from('test'), 'test.mp3');
      expect(result).toBeNull();
    });
  });

  describe('uploadVideoFromBuffer', () => {
    it('should return public url if upload success', async () => {
      mockSupabaseClient.storage.upload.mockResolvedValue({ data: {}, error: null });
      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({ data: { publicUrl: 'http://test.url' } });

      const result = await service.uploadVideoFromBuffer(Buffer.from('test'), 'test.mp4');
      expect(result).toBe('http://test.url');
    });

    it('should return null if upload failed', async () => {
      mockSupabaseClient.storage.upload.mockResolvedValue({ data: null, error: { message: 'fail' } });
      const result = await service.uploadVideoFromBuffer(Buffer.from('test'), 'test.mp4');
      expect(result).toBeNull();
    });
  });

  describe('uploadSongImageFromBuffer', () => {
    it('should return public url if upload success', async () => {
      mockSupabaseClient.storage.upload.mockResolvedValue({ data: {}, error: null });
      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({ data: { publicUrl: 'http://test.url' } });

      const result = await service.uploadSongImageFromBuffer(Buffer.from('test'), 'test.png');
      expect(result).toBe('http://test.url');
    });

    it('should return null if upload failed', async () => {
      mockSupabaseClient.storage.upload.mockResolvedValue({ data: null, error: { message: 'fail' } });
      const result = await service.uploadSongImageFromBuffer(Buffer.from('test'), 'test.png');
      expect(result).toBeNull();
    });
  });

  // Bạn có thể viết thêm test cho uploadAvatarFromBuffer, uploadArtistsImagesFromBuffer, uploadPlaylistsImagesFromBuffer tương tự như trên.
});