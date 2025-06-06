import { Test, TestingModule } from '@nestjs/testing';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { ExecutionContext } from '@nestjs/common';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';

describe('ScoresController', () => {
  let controller: ScoresController;
  let scoresService: ScoresService;
  let notificationsService: NotificationsService;

  const mockScoresService = {
    findAllForAdmin: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
    findAll: jest.fn().mockResolvedValue([{ id: 1 }]),
    findOne: jest.fn().mockImplementation((id: number) => ({ id })),
    update: jest.fn().mockImplementation((id: number, dto: UpdateScoreDto) => ({ id, ...dto })),
    remove: jest.fn().mockImplementation((id: number) => ({ affected: 1 })),
    calculateScore: jest.fn().mockResolvedValue(90),
    create: jest.fn().mockImplementation((dto, buffer) => Promise.resolve({ ...dto, finalScore: dto.finalScore || 0 })),
  };

  const mockNotificationsService = {
    sendNotificationToUser: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScoresController],
      providers: [
        { provide: ScoresService, useValue: mockScoresService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    controller = module.get<ScoresController>(ScoresController);
    scoresService = module.get<ScoresService>(ScoresService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all scores for admin', async () => {
      const req = { user: { adminSecret: true } };
      const result = await controller.findAll(req);
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
      expect(scoresService.findAllForAdmin).toHaveBeenCalled();
    });

    it('should return scores for user', async () => {
      const req = { user: { userId: 'user123' } };
      const result = await controller.findAll(req);
      expect(result).toEqual([{ id: 1 }]);
      expect(scoresService.findAll).toHaveBeenCalledWith('user123');
    });
  });

  describe('findOne', () => {
    it('should return a score by id', () => {
      const result = controller.findOne('5');
      expect(result).toEqual({ id: 5 });
      expect(scoresService.findOne).toHaveBeenCalledWith(5);
    });
  });

  describe('update', () => {
    it('should update a score', () => {
      const dto: UpdateScoreDto = { finalScore: 99 };
      const result = controller.update('3', dto);
      expect(result).toEqual({ id: 3, finalScore: 99 });
      expect(scoresService.update).toHaveBeenCalledWith(3, dto);
    });
  });

  describe('remove', () => {
    it('should remove a score', () => {
      const result = controller.remove('2');
      expect(result).toEqual({ affected: 1 });
      expect(scoresService.remove).toHaveBeenCalledWith(2);
    });
  });

  describe('score', () => {
    it('should calculate and create a score, then send notification', async () => {
      const file = { originalname: 'test.wav', buffer: Buffer.from('test') } as any;
      const createScoreDto: CreateScoreDto = { userId: '', songId: 'song1', finalScore: undefined };
      const req = { user: { userId: 'user123' } };
      const createNotificationDto: any = {};

      const result = await controller.score(file, createScoreDto, req, createNotificationDto);

      expect(scoresService.calculateScore).toHaveBeenCalled();
      expect(scoresService.create).toHaveBeenCalled();
      expect(notificationsService.sendNotificationToUser).toHaveBeenCalled();
      expect(result).toBe('90');
    });

    it('should return message if score is -1', async () => {
      (scoresService.calculateScore as jest.Mock).mockResolvedValueOnce(-1);
      const file = { originalname: 'test.wav', buffer: Buffer.from('test') } as any;
      const createScoreDto: CreateScoreDto = { userId: '', songId: 'song1', finalScore: undefined };
      const req = { user: { userId: 'user123' } };
      const createNotificationDto: any = {};

      const result = await controller.score(file, createScoreDto, req, createNotificationDto);

      expect(result).toBe('Please sing more than 30 seconds!');
    });

    it('should throw error if service throws', async () => {
      (scoresService.calculateScore as jest.Mock).mockResolvedValue(80);
      (scoresService.create as jest.Mock).mockRejectedValue(new Error('Failed'));
      const file = { originalname: 'test.wav', buffer: Buffer.from('test') } as any;
      const createScoreDto: CreateScoreDto = { userId: '', songId: 'song1', finalScore: undefined };
      const req = { user: { userId: 'user123' } };
      const createNotificationDto: any = {};

      await expect(controller.score(file, createScoreDto, req, createNotificationDto)).rejects.toThrow('Failed to create score');
    });
  });
});
