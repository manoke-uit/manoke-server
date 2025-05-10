import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeApiService } from './youtube-api.service';

describe('YoutubeApiService', () => {
  let service: YoutubeApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YoutubeApiService],
    }).compile();

    service = module.get<YoutubeApiService>(YoutubeApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
