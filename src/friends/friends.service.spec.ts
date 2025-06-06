import { Test, TestingModule } from '@nestjs/testing';
import { FriendsService } from './friends.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Friend, FriendStatus } from './entities/friend.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

const mockFriendRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  })),
});
const mockUserRepository = () => ({
  findOneBy: jest.fn(),
});

describe('FriendsService', () => {
  let service: FriendsService;
  let friendRepository: jest.Mocked<Repository<Friend>>;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        { provide: getRepositoryToken(Friend), useFactory: mockFriendRepository },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
    friendRepository = module.get(getRepositoryToken(Friend));
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('sendFriendRequest', () => {
    it('should throw if trying to add yourself', async () => {
      await expect(
        service.sendFriendRequest('user1', { receiverId: 'user1' } as any)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if one user does not exist', async () => {
      userRepository.findOneBy.mockResolvedValueOnce(null as any);
      userRepository.findOneBy.mockResolvedValueOnce({ id: 'user2' } as any);
      await expect(
        service.sendFriendRequest('user1', { receiverId: 'user2' } as any)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if friend request already exists', async () => {
      userRepository.findOneBy.mockResolvedValue({ id: 'user1' } as any);
      friendRepository.findOne.mockResolvedValue({} as any);
      await expect(
        service.sendFriendRequest('user1', { receiverId: 'user2' } as any)
      ).rejects.toThrow(BadRequestException);
    });

    it('should create and save a new friend request', async () => {
      userRepository.findOneBy.mockResolvedValue({ id: 'user1' } as any);
      friendRepository.findOne.mockResolvedValue(null);
      friendRepository.create.mockReturnValue({} as any);
      friendRepository.save.mockResolvedValue({ id: 'friend1' } as any);
      await expect(
        service.sendFriendRequest('user1', { receiverId: 'user2' } as any)
      ).resolves.toEqual({ id: 'friend1' });
    });
  });

  describe('getFriendList', () => {
    it('should return accepted friends', async () => {
      friendRepository.find.mockResolvedValue([{ userId_1: 'user1', status: FriendStatus.ACCEPTED }] as any);
      const result = await service.getFriendList('user1');
      expect(result).toEqual([{ userId_1: 'user1', status: FriendStatus.ACCEPTED }]);
    });
  });

  describe('getRequests', () => {
    it('should return pending requests', async () => {
      friendRepository.find.mockResolvedValue([{ userId_1: 'user1', status: FriendStatus.PENDING }] as any);
      const result = await service.getRequests('user1');
      expect(result).toEqual([{ userId_1: 'user1', status: FriendStatus.PENDING }]);
    });
  });

  describe('findOne', () => {
    it('should return a friend if found', async () => {
      friendRepository.findOne.mockResolvedValue({ userId_1: 'user1', userId_2: 'user2', status: FriendStatus.ACCEPTED } as any);
      const result = await service.findOne('user1', 'user2');
      expect(result).toEqual({ userId_1: 'user1', userId_2: 'user2', status: FriendStatus.ACCEPTED });
    });

    it('should return null if not found', async () => {
      friendRepository.findOne.mockResolvedValue(null);
      const result = await service.findOne('user1', 'user2');
      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should throw if no pending request', async () => {
      friendRepository.findOne.mockResolvedValue(null);
      await expect(
        service.updateStatus('user1', 'user2', { status: FriendStatus.ACCEPTED })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if not receiver', async () => {
      friendRepository.findOne.mockResolvedValue({ userId_2: 'user3', status: FriendStatus.PENDING } as any);
      await expect(
        service.updateStatus('user1', 'user2', { status: FriendStatus.ACCEPTED })
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw if already accepted', async () => {
      friendRepository.findOne.mockResolvedValue({ userId_2: 'user1', status: FriendStatus.ACCEPTED } as any);
      await expect(
        service.updateStatus('user1', 'user2', { status: FriendStatus.ACCEPTED })
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update status to accepted', async () => {
      friendRepository.findOne
        .mockResolvedValueOnce({ userId_2: 'user1', status: FriendStatus.PENDING } as any)
        .mockResolvedValueOnce(null); // for blockedRequest
      friendRepository.update.mockResolvedValue({ affected: 1 } as any);
      await expect(
        service.updateStatus('user1', 'user2', { status: FriendStatus.ACCEPTED })
      ).resolves.toEqual({ affected: 1 });
    });

    it('should update status to blocked', async () => {
      friendRepository.findOne.mockResolvedValue({ userId_2: 'user1', status: FriendStatus.PENDING } as any);
      friendRepository.update.mockResolvedValue({ affected: 1 } as any);
      await expect(
        service.updateStatus('user1', 'user2', { status: FriendStatus.BLOCKED })
      ).resolves.toEqual({ affected: 1 });
    });

    it('should throw on invalid status', async () => {
      friendRepository.findOne.mockResolvedValue({ userId_2: 'user1', status: FriendStatus.PENDING } as any);
      await expect(
        service.updateStatus('user1', 'user2', { status: 'invalid' as any })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeFriend', () => {
    it('should throw if trying to remove yourself', async () => {
      await expect(service.removeFriend('user1', 'user1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw if is receiver of pending', async () => {
      friendRepository.findOne.mockResolvedValue({} as any);
      await expect(service.removeFriend('user1', 'user2')).rejects.toThrow(ForbiddenException);
    });

    it('should delete friend relationship', async () => {
      friendRepository.findOne.mockResolvedValue(null);
      const executeMock = jest.fn().mockResolvedValue({ affected: 1 });
      friendRepository.createQueryBuilder = jest.fn().mockReturnValue({
        delete: () => ({
          from: () => ({
            where: () => ({
              execute: executeMock,
            }),
          }),
        }),
      } as any);
      await expect(service.removeFriend('user1', 'user2')).resolves.toEqual({ affected: 1 });
    });
  });
});