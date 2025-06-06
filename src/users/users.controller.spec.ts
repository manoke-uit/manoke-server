import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { responseHelper } from 'src/helpers/response.helper';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUser = { id: '1', displayName: 'Test', email: 'test@example.com' };

  const mockUsersService = {
    create: jest.fn().mockResolvedValue(mockUser),
    paginate: jest.fn().mockResolvedValue({ items: [mockUser], meta: {} }),
    findViaEmail: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    registerOrUpdateExpoPushToken: jest.fn(),
    remove: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create user', async () => {
      const dto = { displayName: 'Test', email: 'test@example.com', password: '12345678' };
      await expect(controller.create(dto as any)).resolves.toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const result = await controller.findAll(1, 10);
      expect(result).toEqual({ items: [mockUser], meta: {} });
      expect(usersService.paginate).toHaveBeenCalled();
    });
  });

  describe('findOneEmail', () => {
    it('should return user if found', async () => {
      (usersService.findViaEmail as jest.Mock).mockResolvedValue(mockUser);
      const result = await controller.findOneEmail('test@example.com');
      expect(result).toEqual(responseHelper({
        statusCode: 200,
        message: 'User found',
        data: mockUser,
      }));
    });

    it('should return 404 if not found', async () => {
      (usersService.findViaEmail as jest.Mock).mockResolvedValue(null);
      const result = await controller.findOneEmail('notfound@example.com');
      expect(result).toEqual(responseHelper({
        statusCode: 404,
        message: 'User not found',
        data: null,
      }));
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValue(mockUser);
      const result = await controller.findOne('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('registerOrUpdateExpoPushToken', () => {
    it('should call service and return success', async () => {
      await expect(controller.registerOrUpdateExpoPushToken({ userId: '1', expoPushToken: 'ExpoPushToken[xxx]' }))
        .resolves.toEqual({
          statusCode: 200,
          message: 'Expo push token registered or updated successfully.',
        });
      expect(usersService.registerOrUpdateExpoPushToken).toHaveBeenCalledWith('1', 'ExpoPushToken[xxx]');
    });
  });

  describe('update', () => {
    it('should return 404 if user not found', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValue(null);
      const result = await controller.update('1', { displayName: 'New' }, undefined);
      expect(result).toEqual(responseHelper({
        statusCode: 404,
        message: 'User not found',
        data: null,
      }));
    });

    it('should return 500 if update failed', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValue(mockUser);
      (usersService.update as jest.Mock).mockResolvedValue(null);
      const result = await controller.update('1', { displayName: 'New' }, undefined);
      expect(result).toEqual(responseHelper({
        statusCode: 500,
        message: 'Failed to update user',
        data: null,
      }));
    });

    it('should return updated user', async () => {
      (usersService.findOne as jest.Mock).mockResolvedValue(mockUser);
      (usersService.update as jest.Mock).mockResolvedValue({ ...mockUser, displayName: 'New' });
      const result = await controller.update('1', { displayName: 'New' }, undefined);
      expect(result).toEqual(responseHelper({
        statusCode: 200,
        message: 'User updated successfully',
        data: { ...mockUser, displayName: 'New' },
      }));
    });
  });

  describe('remove', () => {
    it('should call service remove', async () => {
      await expect(controller.remove('1')).resolves.toEqual({ affected: 1 });
      expect(usersService.remove).toHaveBeenCalledWith('1');
    });
  });
});