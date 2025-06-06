import { Test, TestingModule } from '@nestjs/testing';
import { KaraokesController } from './karaokes.controller';
import { KaraokesService } from './karaokes.service';
import { CreateKaraokeDto } from './dto/create-karaoke.dto';
import { UpdateKaraokeDto } from './dto/update-karaoke.dto';

describe('KaraokesController', () => {
  let controller: KaraokesController;
  let service: KaraokesService;

  const mockKaraoke = { id: '1', description: 'desc', user: { id: 'u1' }, song: { id: 's1' } };
  const mockResponse = (data: any, message = '', statusCode = 200) => ({
    message,
    data,
    statusCode,
  });

  const karaokesServiceMock = {
    createByUser: jest.fn().mockResolvedValue(mockKaraoke),
    createByAdmin: jest.fn().mockResolvedValue(mockKaraoke),
    findAll: jest.fn().mockResolvedValue([mockKaraoke]),
    findAllByUserId: jest.fn().mockResolvedValue([mockKaraoke]),
    findAllBySongId: jest.fn().mockResolvedValue([mockKaraoke]),
    findOne: jest.fn().mockResolvedValue(mockKaraoke),
    findKaraokeAndChangeStatusToPending: jest.fn().mockResolvedValue(mockKaraoke),
    findKaraokeAndChangeStatusToPublic: jest.fn().mockResolvedValue(mockKaraoke),
    findKaraokeAndChangeStatusToPrivate: jest.fn().mockResolvedValue(mockKaraoke),
    update: jest.fn().mockResolvedValue(mockKaraoke),
    remove: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KaraokesController],
      providers: [
        { provide: KaraokesService, useValue: karaokesServiceMock },
      ],
    }).compile();

    controller = module.get<KaraokesController>(KaraokesController);
    service = module.get<KaraokesService>(KaraokesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createByUser', () => {
    it('should create karaoke by user', async () => {
      const file = { originalname: 'test.mp4', buffer: Buffer.from('') } as any;
      const dto: CreateKaraokeDto = {
        description: 'desc',
        videoUrl: 'http://video.url',
        songId: 's1',
        userId: 'u1',
      };
      const req = { user: { userId: 'u1' } };
      const result = await controller.createByUser(file, dto, req);
      expect(service.createByUser).toHaveBeenCalled();
      expect(result.statusCode).toBe(201);
    });

    it('should create karaoke by admin if adminSecret present', async () => {
      const file = { originalname: 'test.mp4', buffer: Buffer.from('') } as any;
      const dto: CreateKaraokeDto = {
        description: 'desc',
        videoUrl: 'http://video.url',
        songId: 's1',
        userId: 'u1',
      };
      const req = { user: { userId: 'u1', adminSecret: 'secret' } };
      const result = await controller.createByUser(file, dto, req);
      expect(service.createByAdmin).toHaveBeenCalled();
      expect(result.statusCode).toBe(201);
    });
  });

  describe('findAll', () => {
    it('should return all karaokes', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result.data).toBeDefined();
      expect(result.statusCode).toBe(200);
    });
  });

  describe('findAllByUserId', () => {
    it('should return all karaokes by user id', async () => {
      const req = { user: { userId: 'u1' } };
      const result = await controller.findAllByUserId(req);
      expect(service.findAllByUserId).toHaveBeenCalledWith('u1');
      expect(result.statusCode).toBe(200);
    });
  });

  describe('findOne', () => {
    it('should return a karaoke by id', async () => {
      const result = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result.statusCode).toBe(200);
    });
  });

  describe('findKaraokeAndChangeStatusToPending', () => {
    it('should change status to pending', async () => {
      const result = await controller.findKaraokeAndChangeStatusToPending('1');
      expect(service.findKaraokeAndChangeStatusToPending).toHaveBeenCalledWith('1');
      expect(result.statusCode).toBe(200);
    });
  });

  describe('findKaraokeAndChangeStatusToPublic', () => {
    it('should change status to public', async () => {
      const result = await controller.findKaraokeAndChangeStatusToPublic('1');
      expect(service.findKaraokeAndChangeStatusToPublic).toHaveBeenCalledWith('1');
      expect(result.statusCode).toBe(200);
    });
  });

  describe('findKaraokeAndChangeStatusToPrivate', () => {
    it('should change status to private', async () => {
      const result = await controller.findKaraokeAndChangeStatusToPrivate('1');
      expect(service.findKaraokeAndChangeStatusToPrivate).toHaveBeenCalledWith('1');
      expect(result.statusCode).toBe(200);
    });
  });

  describe('findAllBySongId', () => {
    it('should return all karaokes by song id', async () => {
      const result = await controller.findAllBySongId('s1');
      expect(service.findAllBySongId).toHaveBeenCalledWith('s1');
      expect(result.statusCode).toBe(200);
    });
  });

  describe('update', () => {
    it('should update karaoke if authorized', async () => {
      service.findOne = jest.fn().mockResolvedValue({ ...mockKaraoke, user: { id: 'u1' } });
      const req = { user: { userId: 'u1' } };
      const dto: UpdateKaraokeDto = { description: 'new desc' } as any;
      const result = await controller.update('1', dto, req, undefined);
      expect(service.update).toHaveBeenCalled();
      expect(result.statusCode).toBe(200);
    });

    it('should not update karaoke if not authorized', async () => {
      // Simulate a karaoke owned by another user and no adminSecret on req
      service.findOne = jest.fn().mockResolvedValue({ ...mockKaraoke, user: { id: 'u2' } });
      const req = { user: { userId: 'u1' } };
      const dto: UpdateKaraokeDto = { description: 'new desc' } as any;
      const result = await controller.update('1', dto, req, undefined);
      expect(result.statusCode).toBe(403);
      expect(result.message).toBe('You are not authorized to update this karaoke');
    });

    it('should update karaoke if adminSecret matches', async () => {
      // Simulate a karaoke owned by another user but adminSecret matches
      service.findOne = jest.fn().mockResolvedValue({ ...mockKaraoke, user: { id: 'u2', adminSecret: 'secret' } });
      const req = { user: { userId: 'u1', adminSecret: 'secret' } };
      const dto: UpdateKaraokeDto = { description: 'admin update' } as any;
      const result = await controller.update('1', dto, req, undefined);
      expect(service.update).toHaveBeenCalled();
      expect(result.statusCode).toBe(200);
    });

    it('should return 400 if update fails', async () => {
      service.findOne = jest.fn().mockResolvedValue({ ...mockKaraoke, user: { id: 'u1' } });
      service.update = jest.fn().mockResolvedValue(null);
      const req = { user: { userId: 'u1' } };
      const dto: UpdateKaraokeDto = { description: 'fail update' } as any;
      const result = await controller.update('1', dto, req, undefined);
      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Karaoke update failed');
    });
  });

  describe('remove', () => {
    it('should remove karaoke if authorized', async () => {
      service.findOne = jest.fn().mockResolvedValue({ ...mockKaraoke, user: { id: 'u1' } });
      const req = { user: { userId: 'u1' } };
      const result = await controller.remove('1', req);
      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result.statusCode).toBe(200);
    });

    it('should not remove karaoke if not authorized', async () => {
      // Simulate a karaoke owned by another user and no adminSecret on req
      service.findOne = jest.fn().mockResolvedValue({ ...mockKaraoke, user: { id: 'u2' } });
      const req = { user: { userId: 'u1' } };
      const result = await controller.remove('1', req);
      expect(result.statusCode).toBe(403);
      expect(result.message).toBe('You are not authorized to delete this karaoke');
    });

    it('should remove karaoke if adminSecret matches', async () => {
      // Simulate a karaoke owned by another user but adminSecret matches
      service.findOne = jest.fn().mockResolvedValue({ ...mockKaraoke, user: { id: 'u2', adminSecret: 'secret' } });
      const req = { user: { userId: 'u1', adminSecret: 'secret' } };
      const result = await controller.remove('1', req);
      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result.statusCode).toBe(200);
    });

    it('should return 400 if remove fails', async () => {
      service.findOne = jest.fn().mockResolvedValue({ ...mockKaraoke, user: { id: 'u1' } });
      service.remove = jest.fn().mockResolvedValue(null);
      const req = { user: { userId: 'u1' } };
      const result = await controller.remove('1', req);
      expect(result.statusCode).toBe(400);
      expect(result.message).toBe('Karaoke deletion failed');
    });
  });

  describe('findAll', () => {
    it('should return 404 if no karaokes found', async () => {
      service.findAll = jest.fn().mockResolvedValue(null);
      const result = await controller.findAll();
      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('No karaokes found');
    });
  });

  describe('findAllByUserId', () => {
    it('should return 404 if no karaokes found for user', async () => {
      service.findAllByUserId = jest.fn().mockResolvedValue(null);
      const req = { user: { userId: 'u1' } };
      const result = await controller.findAllByUserId(req);
      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('Karaoke not found');
    });
  });

  describe('findOne', () => {
    it('should return 404 if karaoke not found', async () => {
      service.findOne = jest.fn().mockResolvedValue(null);
      const result = await controller.findOne('notfound');
      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('Karaoke not found');
    });
  });

  describe('findKaraokeAndChangeStatusToPending', () => {
    it('should return 404 if karaoke not found', async () => {
      service.findKaraokeAndChangeStatusToPending = jest.fn().mockResolvedValue(null);
      const result = await controller.findKaraokeAndChangeStatusToPending('notfound');
      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('Karaoke not found');
    });
  });

  describe('findKaraokeAndChangeStatusToPublic', () => {
    it('should return 404 if karaoke not found', async () => {
      service.findKaraokeAndChangeStatusToPublic = jest.fn().mockResolvedValue(null);
      const result = await controller.findKaraokeAndChangeStatusToPublic('notfound');
      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('sth wrong');
    });
  });

  describe('findKaraokeAndChangeStatusToPrivate', () => {
    it('should return 404 if karaoke not found', async () => {
      service.findKaraokeAndChangeStatusToPrivate = jest.fn().mockResolvedValue(null);
      const result = await controller.findKaraokeAndChangeStatusToPrivate('notfound');
      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('sth wrong');
    });
  });

  describe('findAllBySongId', () => {
    it('should return 404 if no karaokes found for song', async () => {
      service.findAllBySongId = jest.fn().mockResolvedValue(null);
      const result = await controller.findAllBySongId('notfound');
      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('Karaoke not found');
    });
  });
});
