import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

const mockNotificationsService = {
  sendNotificationToUser: jest.fn(),
  sendNotificationToAllUser: jest.fn(),
  getAll: jest.fn(),
  countUnread: jest.fn(),
  markAsRead: jest.fn(),
  remove: jest.fn(),
};

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: typeof mockNotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get(NotificationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendNotificationToUser', () => {
    it('should call service and return success', async () => {
      service.sendNotificationToUser.mockResolvedValue(undefined);
      const dto: CreateNotificationDto = {
        title: 'Test',
        description: 'desc',
        userId: 'user1',
      } as any;
      const result = await controller.sendNotificationToUser(dto);
      expect(service.sendNotificationToUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Notification sent successfully.',
      });
    });
  });

  describe('sendNotificationToAllUser', () => {
    it('should call service and return success', async () => {
      service.sendNotificationToAllUser.mockResolvedValue(undefined);
      const body = { title: 'Test', description: 'desc' };
      const result = await controller.sendNotificationToAllUser(body);
      expect(service.sendNotificationToAllUser).toHaveBeenCalledWith('Test', 'desc');
      expect(result).toEqual({
        statusCode: 200,
        message: 'Notification sent successfully.',
      });
    });
  });

  describe('getUserNotifications', () => {
    it('should return notifications for user', async () => {
      service.getAll.mockResolvedValue([{ id: 'n1' }]);
      const result = await controller.getUserNotifications('user1');
      expect(service.getAll).toHaveBeenCalledWith('user1');
      expect(result).toEqual([{ id: 'n1' }]);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      service.countUnread.mockResolvedValue(3);
      const result = await controller.getUnreadCount('user1');
      expect(service.countUnread).toHaveBeenCalledWith('user1');
      expect(result).toBe(3);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      service.markAsRead.mockResolvedValue({ id: 'n1', isRead: true });
      const result = await controller.markAsRead('n1');
      expect(service.markAsRead).toHaveBeenCalledWith('n1');
      expect(result).toEqual({ id: 'n1', isRead: true });
    });
  });

  describe('remove', () => {
    it('should remove notification', async () => {
      service.remove.mockResolvedValue({ affected: 1 });
      const result = await controller.remove('n1');
      expect(service.remove).toHaveBeenCalledWith('n1');
      expect(result).toEqual({ affected: 1 });
    });
  });
});