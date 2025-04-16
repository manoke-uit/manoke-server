import { Test, TestingModule } from '@nestjs/testing';
import { LyricsOvhApiService } from './lyrics.ovh-api.service';

describe('LyricsOvhApiService', () => {
  let service: LyricsOvhApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LyricsOvhApiService],
    }).compile();

    service = module.get<LyricsOvhApiService>(LyricsOvhApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
