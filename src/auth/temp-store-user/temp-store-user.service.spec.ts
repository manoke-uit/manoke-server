import { Test, TestingModule } from '@nestjs/testing';
import { TempStoreUserService } from './temp-store-user.service';

describe('TempStoreUserService', () => {
  let service: TempStoreUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TempStoreUserService],
    }).compile();

    service = module.get<TempStoreUserService>(TempStoreUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
