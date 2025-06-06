import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Notification } from 'src/notifications/entities/notification.entity';
import { UserDevice } from './entities/user-device.entity';
import { Repository, DeleteResult } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PlaylistsService } from 'src/playlists/playlists.service';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

const mockUser = {
  id: 'user-id',
  displayName: 'Test User',
  email: 'test@example.com',
  password: 'hashedpassword',
  imageUrl: '',
  createdAt: new Date(),
  adminSecret: '',
};

const mockCreateUserDto = {
  displayName: 'Test User',
  email: 'test@example.com',
  password: 'Password@123',
  imageUrl: undefined,
  adminSecret: undefined,
};

const mockUpdateUserDto = {
  displayName: 'Updated Name',
  email: 'updated@example.com',
};

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User>;
  let userDevicesRepository: Repository<UserDevice>;
  let configService: ConfigService;
  let playlistsService: PlaylistsService;
  let supabaseStorageService: SupabaseStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserDevice),
          useValue: {
            save: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('ADMIN_SECRET'),
          },
        },
        {
          provide: PlaylistsService,
          useValue: {
            createFavouritePlaylist: jest.fn(),
          },
        },
        {
          provide: SupabaseStorageService,
          useValue: {
            uploadAvatarFromBuffer: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
    userDevicesRepository = module.get(getRepositoryToken(UserDevice));
    configService = module.get(ConfigService);
    playlistsService = module.get(PlaylistsService);
    supabaseStorageService = module.get(SupabaseStorageService);

    mockBcrypt.genSalt.mockResolvedValue('salt' as never);
    mockBcrypt.hash.mockResolvedValue('hashedpassword' as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a user without password and adminSecret', async () => {
      (usersRepository.save as jest.Mock).mockResolvedValue({ ...mockUser });
      const result = await service.create(mockCreateUserDto as any);
      expect(result.password).toBe('');
      expect(result.adminSecret).toBe('');
      expect(usersRepository.save).toHaveBeenCalled();
    });

    it('should set adminSecret if provided and matches config', async () => {
      (usersRepository.save as jest.Mock).mockResolvedValue({ ...mockUser });
      const dto = { ...mockCreateUserDto, adminSecret: 'ADMIN_SECRET' };
      await service.create(dto as any);
      expect(usersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ adminSecret: 'ADMIN_SECRET' }),
      );
    });
  });

  describe('findViaEmail', () => {
    it('should return user with password and adminSecret cleared', async () => {
      (usersRepository.findOne as jest.Mock).mockResolvedValue({ ...mockUser });
      const result = await service.findViaEmail('test@example.com');
      expect(result?.password).toBe('');
      expect(result?.adminSecret).toBe('');
    });

    it('should throw NotFoundException if user not found', async () => {
      (usersRepository.findOne as jest.Mock).mockResolvedValue(undefined);
      await expect(service.findViaEmail('notfound@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('registerOrUpdateExpoPushToken', () => {
    beforeAll(() => {
      jest.mock('expo-server-sdk', () => ({
        isExpoPushToken: (token: string) => token.startsWith('ExpoPushToken'),
      }));
    });

    it('should throw BadRequestException for invalid token', async () => {
      await expect(
        service.registerOrUpdateExpoPushToken('user-id', 'invalidToken'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      (usersRepository.findOneBy as jest.Mock).mockResolvedValue(undefined);
      await expect(
        service.registerOrUpdateExpoPushToken('user-id', 'ExpoPushToken[xxx]'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create new UserDevice if not exists', async () => {
      (usersRepository.findOneBy as jest.Mock).mockResolvedValue(mockUser);
      (userDevicesRepository.findOneBy as jest.Mock).mockResolvedValue(undefined);
      (userDevicesRepository.save as jest.Mock).mockResolvedValue({});
      await service.registerOrUpdateExpoPushToken('user-id', 'ExpoPushToken[xxx]');
      expect(userDevicesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUser,
          expoPushToken: 'ExpoPushToken[xxx]',
        }),
      );
    });

    it('should update UserDevice if exists', async () => {
      (usersRepository.findOneBy as jest.Mock).mockResolvedValue(mockUser);
      (userDevicesRepository.findOneBy as jest.Mock).mockResolvedValue({ id: 'device-id', user: null, expoPushToken: 'ExpoPushToken[xxx]' });
      (userDevicesRepository.save as jest.Mock).mockResolvedValue({});
      await service.registerOrUpdateExpoPushToken('user-id', 'ExpoPushToken[xxx]');
      expect(userDevicesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUser,
        }),
      );
    });
  });

  describe('getExpoPushTokens', () => {
    it('should return token list', async () => {
      (userDevicesRepository.find as jest.Mock).mockResolvedValue([
        { expoPushToken: 'token1' },
        { expoPushToken: 'token2' },
      ]);
      const result = await service.getExpoPushTokens('user-id');
      expect(result).toEqual(['token1', 'token2']);
    });

    it('should throw NotFoundException if userDevice is undefined', async () => {
      (userDevicesRepository.find as jest.Mock).mockResolvedValue(undefined);
      await expect(service.getExpoPushTokens('user-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      (usersRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      (usersRepository.findOne as jest.Mock).mockResolvedValue(undefined);
      await expect(service.findByEmail('notfound@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDisplayName', () => {
    it('should return user by displayName', async () => {
      (usersRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.findByDisplayName('Test User');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      (usersRepository.findOne as jest.Mock).mockResolvedValue(undefined);
      await expect(service.findByDisplayName('notfound')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      (usersRepository.find as jest.Mock).mockResolvedValue([mockUser]);
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      (usersRepository.findOneBy as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.findOne('user-id');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if not found', async () => {
      (usersRepository.findOneBy as jest.Mock).mockResolvedValue(undefined);
      await expect(service.findOne('notfound')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user fields', async () => {
      (usersRepository.findOneBy as jest.Mock).mockResolvedValue({ ...mockUser });
      (usersRepository.save as jest.Mock).mockResolvedValue({ ...mockUser, ...mockUpdateUserDto });
      const result = await service.update('user-id', mockUpdateUserDto as any);
      expect(result).not.toBeNull();
      expect(result!.displayName).toBe('Updated Name');
      expect(result!.email).toBe('updated@example.com');
    });

    it('should update image if buffer and name provided', async () => {
      (usersRepository.findOneBy as jest.Mock).mockResolvedValue({ ...mockUser });
      (supabaseStorageService.uploadAvatarFromBuffer as jest.Mock).mockResolvedValue('http://image.url');
      (usersRepository.save as jest.Mock).mockResolvedValue({ ...mockUser, imageUrl: 'http://image.url' });
      const result = await service.update('user-id', mockUpdateUserDto as any, Buffer.from('img'), 'avatar.jpg');
      expect(result!.imageUrl).toBe('http://image.url');
    });

    it('should throw NotFoundException if user not found', async () => {
      (usersRepository.findOneBy as jest.Mock).mockResolvedValue(undefined);
      await expect(service.update('notfound', mockUpdateUserDto as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw Error if image upload fails', async () => {
      (usersRepository.findOneBy as jest.Mock).mockResolvedValue({ ...mockUser });
      (supabaseStorageService.uploadAvatarFromBuffer as jest.Mock).mockResolvedValue(undefined);
      await expect(
        service.update('user-id', mockUpdateUserDto as any, Buffer.from('img'), 'avatar.jpg')
      ).rejects.toThrow(Error);
    });

    it('should throw Error if image upload throws', async () => {
      (usersRepository.findOneBy as jest.Mock).mockResolvedValue({ ...mockUser });
      (supabaseStorageService.uploadAvatarFromBuffer as jest.Mock).mockRejectedValue(new Error('fail'));
      await expect(
        service.update('user-id', mockUpdateUserDto as any, Buffer.from('img'), 'avatar.jpg')
      ).rejects.toThrow(Error);
    });
  });

  describe('remove', () => {
    it('should call repository.delete', async () => {
      const deleteResult: DeleteResult = { affected: 1, raw: [] };
      (usersRepository.delete as jest.Mock).mockResolvedValue(deleteResult);
      const result = await service.remove('user-id');
      expect(result).toEqual(deleteResult);
    });
  });
});