import { Test, TestingModule } from '@nestjs/testing';
import { KaraokesService } from './karaokes.service';

describe('KaraokesService', () => {
  let service: KaraokesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KaraokesService],
    }).compile();

    service = module.get<KaraokesService>(KaraokesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
