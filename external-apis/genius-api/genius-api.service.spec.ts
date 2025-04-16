import { Test, TestingModule } from '@nestjs/testing';
import { GeniusApiService } from './genius-api.service';

describe('GeniusApiService', () => {
  let service: GeniusApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeniusApiService],
    }).compile();

    service = module.get<GeniusApiService>(GeniusApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
