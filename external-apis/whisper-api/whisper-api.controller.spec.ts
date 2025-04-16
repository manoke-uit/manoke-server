import { Test, TestingModule } from '@nestjs/testing';
import { WhisperApiController } from './whisper-api.controller';

describe('WhisperApiController', () => {
  let controller: WhisperApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhisperApiController],
    }).compile();

    controller = module.get<WhisperApiController>(WhisperApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
