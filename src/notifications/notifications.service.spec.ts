import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { UserDevice } from 'src/users/entities/user-device.entity';
import { User } from 'src/users/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

const mockNotificationRepo = () => ({
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  delete: jest.fn(),
});
const mockUserDeviceRepo = () => ({
  find: jest.fn(),
});
const mockUserRepo = () => ({
  findOneBy: jest.fn(),
});

jest.mock('expo-server-sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chunkPushNotifications: jest.fn((msgs) => [msgs]),
      sendPushNotificationsAsync: jest.fn().mockResolvedValue([{ id: 'ticket1' }]),
    })),
    Expo: {
      isExpoPushToken: jest.fn((token) => token.startsWith('ExpoPushToken')),
    },
  };
});

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepo: ReturnType<typeof mockNotificationRepo>;
  let userDeviceRepo: ReturnType<typeof mockUserDeviceRepo>;
  let userRepo: ReturnType<typeof mockUserRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useFactory: mockNotificationRepo },
        { provide: getRepositoryToken(UserDevice), useFactory: mockUserDeviceRepo },
        { provide: getRepositoryToken(User), useFactory: mockUserRepo },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepo = module.get(getRepositoryToken(Notification));
    userDeviceRepo = module.get(getRepositoryToken(UserDevice));
    userRepo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendNotificationToUser', () => {
    it('should throw if user has no device tokens', async () => {
      userDeviceRepo.find.mockResolvedValue([]);
      await expect(
        service.sendNotificationToUser({ userId: 'u1', title: 't', description: 'd' })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if user not found', async () => {
      userDeviceRepo.find.mockResolvedValue([{ expoPushToken: 'ExpoPushToken123', user: { id: 'u1' } }]);
      userRepo.findOneBy.mockResolvedValue(null);
      await expect(
        service.sendNotificationToUser({ userId: 'u1', title: 't', description: 'd' })
      ).rejects.toThrow('User not found');
    });

    it('should save notification and send push', async () => {
      userDeviceRepo.find.mockResolvedValue([{ expoPushToken: 'ExpoPushToken123', user: { id: 'u1' } }]);
      userRepo.findOneBy.mockResolvedValue({ id: 'u1' });
      notificationRepo.save.mockResolvedValue({});
      const spy = jest.spyOn(service as any, 'sendPushNotification').mockResolvedValue(undefined);

      await service.sendNotificationToUser({ userId: 'u1', title: 't', description: 'd' });
      expect(notificationRepo.save).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('sendNotificationToAllUser', () => {
    it('should throw if no tokens found', async () => {
      userDeviceRepo.find.mockResolvedValue([]);
      await expect(service.sendNotificationToAllUser('t', 'd')).rejects.toThrow(NotFoundException);
    });

    it('should save notifications and send push', async () => {
      userDeviceRepo.find.mockResolvedValue([
        { expoPushToken: 'ExpoPushToken1', user: { id: 'u1' } },
        { expoPushToken: 'ExpoPushToken2', user: { id: 'u2' } },
      ]);
      notificationRepo.save.mockResolvedValue({});
      const spy = jest.spyOn(service as any, 'sendPushNotification').mockResolvedValue(undefined);

      await service.sendNotificationToAllUser('t', 'd');
      expect(notificationRepo.save).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return notifications for user', async () => {
      notificationRepo.find.mockResolvedValue([{ id: 'n1' }]);
      const result = await service.getAll('u1');
      expect(notificationRepo.find).toHaveBeenCalledWith({
        where: { user: { id: 'u1' } },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([{ id: 'n1' }]);
    });
  });

  describe('markAsRead', () => {
    it('should update and return notification', async () => {
      notificationRepo.findOne.mockResolvedValue({ id: 'n1', isRead: true });
      notificationRepo.update.mockResolvedValue({});
      const result = await service.markAsRead('n1');
      expect(notificationRepo.update).toHaveBeenCalledWith('n1', { isRead: true });
      expect(result).toEqual({ id: 'n1', isRead: true });
    });
  });

  describe('countUnread', () => {
    it('should count unread notifications', async () => {
      notificationRepo.count.mockResolvedValue(2);
      const result = await service.countUnread('u1');
      expect(notificationRepo.count).toHaveBeenCalledWith({
        where: { user: { id: 'u1' }, isRead: false },
      });
      expect(result).toBe(2);
    });
  });

  describe('remove', () => {
    it('should delete notification', async () => {
      notificationRepo.delete.mockResolvedValue({ affected: 1 });
      const result = await service.remove('n1');
      expect(notificationRepo.delete).toHaveBeenCalledWith('n1');
      expect(result).toEqual({ affected: 1 });
    });
  });
});