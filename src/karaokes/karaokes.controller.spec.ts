import { Test, TestingModule } from '@nestjs/testing';
import { KaraokesController } from './karaokes.controller';
import { KaraokesService } from './karaokes.service';

describe('KaraokesController', () => {
  let controller: KaraokesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KaraokesController],
      providers: [KaraokesService],
    }).compile();

    controller = module.get<KaraokesController>(KaraokesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
