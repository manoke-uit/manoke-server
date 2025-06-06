import { Test, TestingModule } from '@nestjs/testing';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Friend, FriendStatus } from './entities/friend.entity';
import { UpdateResult } from 'typeorm';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';

describe('FriendsController', () => {
  let controller: FriendsController;
  let service: FriendsService;

  const mockUser = { userId: 'user-1', email: 'test@example.com' };
  const mockReq = { user: mockUser } as RequestWithUser;

  const mockFriend: Friend = {
    userId_1: 'user-1',
    userId_2: 'user-2',
    status: FriendStatus.PENDING,
    user_1: {} as any,
    user_2: {} as any,
    createdAt: new Date(),
  };

  const mockUpdateResult: UpdateResult = { affected: 1, generatedMaps: [], raw: [] };

  const mockFriendsService = {
    sendFriendRequest: jest.fn().mockResolvedValue(mockFriend),
    getFriendList: jest.fn().mockResolvedValue([mockFriend]),
    getRequests: jest.fn().mockResolvedValue([mockFriend]),
    findOne: jest.fn().mockResolvedValue(mockFriend),
    updateStatus: jest.fn().mockResolvedValue(mockUpdateResult),
    removeFriend: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendsController],
      providers: [
        { provide: FriendsService, useValue: mockFriendsService },
      ],
    }).compile();

    controller = module.get<FriendsController>(FriendsController);
    service = module.get<FriendsService>(FriendsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call sendFriendRequest on create', async () => {
    const dto: CreateFriendDto = { receiverId: 'user-2' };
    const result = await controller.create(mockReq, dto);
    expect(service.sendFriendRequest).toHaveBeenCalledWith(mockUser.userId, dto);
    expect(result).toEqual(mockFriend);
  });

  it('should call getFriendList', async () => {
    const result = await controller.getFriendList(mockReq);
    expect(service.getFriendList).toHaveBeenCalledWith(mockUser.userId);
    expect(result).toEqual([mockFriend]);
  });

  it('should call getRequests', async () => {
    const result = await controller.findAll(mockReq);
    expect(service.getRequests).toHaveBeenCalledWith(mockUser.userId);
    expect(result).toEqual([mockFriend]);
  });

  it('should call findOne', async () => {
    const result = await controller.findOne('user-2', mockReq);
    expect(service.findOne).toHaveBeenCalledWith(mockUser.userId, 'user-2');
    expect(result).toEqual(mockFriend);
  });

  it('should call updateStatus', async () => {
    const dto: UpdateFriendDto = { status: FriendStatus.ACCEPTED };
    const result = await controller.updateFriendRequestStatus(mockReq, 'user-2', dto);
    expect(service.updateStatus).toHaveBeenCalledWith(mockUser.userId, 'user-2', dto);
    expect(result).toEqual(mockUpdateResult);
  });

  it('should call removeFriend', async () => {
    const result = await controller.remove(mockReq, 'user-2');
    expect(service.removeFriend).toHaveBeenCalledWith(mockUser.userId, 'user-2');
    expect(result).toEqual({ affected: 1 });
  });

  // Thêm các test cho trường hợp lỗi
  it('should throw if sendFriendRequest fails', async () => {
    (service.sendFriendRequest as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(controller.create(mockReq, { receiverId: 'user-2' })).rejects.toThrow('fail');
  });

  it('should throw if getFriendList fails', async () => {
    (service.getFriendList as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(controller.getFriendList(mockReq)).rejects.toThrow('fail');
  });

  it('should throw if getRequests fails', async () => {
    (service.getRequests as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(controller.findAll(mockReq)).rejects.toThrow('fail');
  });

  it('should throw if findOne fails', async () => {
    (service.findOne as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(controller.findOne('user-2', mockReq)).rejects.toThrow('fail');
  });

  it('should throw if updateStatus fails', async () => {
    (service.updateStatus as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(controller.updateFriendRequestStatus(mockReq, 'user-2', { status: FriendStatus.ACCEPTED })).rejects.toThrow('fail');
  });

  it('should throw if removeFriend fails', async () => {
    (service.removeFriend as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await expect(controller.remove(mockReq, 'user-2')).rejects.toThrow('fail');
  });

  // Test các trường hợp truyền tham số không hợp lệ
  it('should call sendFriendRequest with correct params', async () => {
    const dto: CreateFriendDto = { receiverId: 'user-3' };
    await controller.create(mockReq, dto);
    expect(service.sendFriendRequest).toHaveBeenCalledWith(mockUser.userId, dto);
  });

  it('should call updateStatus with correct params', async () => {
    const dto: UpdateFriendDto = { status: FriendStatus.BLOCKED };
    await controller.updateFriendRequestStatus(mockReq, 'user-3', dto);
    expect(service.updateStatus).toHaveBeenCalledWith(mockUser.userId, 'user-3', dto);
  });

  it('should call sendFriendRequest on create', async () => {
    const dto: CreateFriendDto = { receiverId: 'user-2' };
    const result = await controller.create(mockReq, dto);
    expect(service.sendFriendRequest).toHaveBeenCalledWith(mockUser.userId, dto);
    expect(result).toEqual(mockFriend);
  });

  it('should call getFriendList', async () => {
    const result = await controller.getFriendList(mockReq);
    expect(service.getFriendList).toHaveBeenCalledWith(mockUser.userId);
    expect(result).toEqual([mockFriend]);
  });

  it('should call getRequests', async () => {
    const result = await controller.findAll(mockReq);
    expect(service.getRequests).toHaveBeenCalledWith(mockUser.userId);
    expect(result).toEqual([mockFriend]);
  });

  it('should call findOne', async () => {
    const result = await controller.findOne('user-2', mockReq);
    expect(service.findOne).toHaveBeenCalledWith(mockUser.userId, 'user-2');
    expect(result).toEqual(mockFriend);
  });

  it('should call updateStatus', async () => {
    const dto: UpdateFriendDto = { status: FriendStatus.ACCEPTED};
    const result = await controller.updateFriendRequestStatus(mockReq, 'user-2', dto);
    expect(service.updateStatus).toHaveBeenCalledWith(mockUser.userId, 'user-2', dto);
    expect(result).toEqual(mockUpdateResult);
  });

  it('should call removeFriend', async () => {
    const result = await controller.remove(mockReq, 'user-2');
    expect(service.removeFriend).toHaveBeenCalledWith(mockUser.userId, 'user-2');
    expect(result).toEqual({ affected: 1 });
  });
});
