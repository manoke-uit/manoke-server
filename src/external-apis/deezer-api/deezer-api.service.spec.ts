import { Test, TestingModule } from '@nestjs/testing';
import { DeezerApiService } from './deezer-api.service';

describe('DeezerApiService', () => {
  let service: DeezerApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeezerApiService],
    }).compile();

    service = module.get<DeezerApiService>(DeezerApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
