import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from './otp/otp.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true),
  }),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let otpService: OtpService;
  let userRepository: Repository<User>;

  const mockUser: User = {
    id: 'user-id',
    displayName: 'Test User',
    email: 'test@example.com',
    password: '$2a$10$hashedpassword',
    adminSecret: undefined,
    imageUrl: '',
    createdAt: new Date(),
    notifications: [],
    playlists: [],
    scores: [],
    karaokes: [],
    posts: [],
    comments: [],
    userDevices: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockUser),
            findByEmail: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('signed-jwt'),
            signAsync: jest.fn().mockResolvedValue('signed-jwt-async'),
          },
        },
        {
          provide: OtpService,
          useValue: {
            generateOtpToken: jest.fn().mockResolvedValue('otp-token'),
            decodeOtpToken: jest.fn().mockResolvedValue({ otp: '123456', email: mockUser.email }),
            getToken: jest.fn().mockResolvedValue('otp-token'),
            verifyOtpToken: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
            findOneBy: jest.fn().mockResolvedValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    otpService = module.get<OtpService>(OtpService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email successfully', async () => {
      const result = await service.sendVerificationEmail('test@example.com');
      expect(result).toEqual({ message: "Verification sent, please check your email to continue" });
    });

    it('should throw error if sending fails', async () => {
      jest.spyOn(otpService, 'generateOtpToken').mockRejectedValueOnce(new Error('fail'));
      await expect(service.sendVerificationEmail('test@example.com')).rejects.toThrow('Unable to send verification email');
    });
  });

  describe('confirmVerification', () => {
    it('should verify and create user on sign-up', async () => {
      const dto: CreateUserDto = {
        displayName: 'Test',
        email: 'test@example.com',
        password: 'Password1!',
      };
      jest.spyOn(otpService, 'verifyOtpToken').mockResolvedValueOnce(true);
      const result = await service.confirmVerification('123456', dto, false);
      expect(result).toEqual({ success: true, message: 'Verified sign-up successfully.' });
    });

    it('should throw error if OTP token does not exist', async () => {
      jest.spyOn(otpService, 'getToken').mockResolvedValueOnce(null);
      await expect(service.confirmVerification('123456', { displayName: 'Test', email: 'test@example.com', password: 'Password1!' }, false))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({ ...mockUser, password: await require('bcryptjs').hash('oldPass', 10) });
      const result = await service.changePassword('user-id', 'oldPass', 'newPass123!');
      expect(result).toEqual({ message: 'Password successfully changed' });
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.changePassword('user-id', 'oldPass', 'newPass123!')).rejects.toThrow('User not found');
    });

    it('should throw error if old password is incorrect', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce({ ...mockUser, password: await require('bcryptjs').hash('other', 10) });
      await expect(service.changePassword('user-id', 'oldPass', 'newPass123!')).rejects.toThrow('Old password is incorrect');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
      const result = await service.resetPassword('test@example.com', 'NewPass1!', 'NewPass1!');
      expect(result).toEqual({ message: 'Password has been reset successfully' });
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.resetPassword('notfound@example.com', 'NewPass1!', 'NewPass1!')).rejects.toThrow('User not found');
    });

    it('should throw error if passwords do not match', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
      await expect(service.resetPassword('test@example.com', 'NewPass1!', 'OtherPass')).rejects.toThrow('New password and verified password do not match');
    });
  });

  describe('signup', () => {
    it('should throw ForbiddenException if email exists', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser);
      await expect(service.signup({ displayName: 'Test', email: 'test@example.com', password: 'Password1!' }))
        .rejects.toThrow(ForbiddenException);
    });

    it('should send verification email if email does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);
      const result = await service.signup({ displayName: 'Test', email: 'test2@example.com', password: 'Password1!' });
      expect(result).toEqual({ message: "Verification sent, please check your email to continue" });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(undefined as unknown as User);
      await expect(service.login({ email: 'notfound@example.com', password: 'Password1!' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce({ ...mockUser, password: await require('bcryptjs').hash('other', 10) });
      await expect(service.login({ email: 'test@example.com', password: 'wrongpass' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should return accessToken if login is successful', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce({ ...mockUser, password: await require('bcryptjs').hash('Password1!', 10) });
      const result = await service.login({ email: 'test@example.com', password: 'Password1!' });
      expect(result).toEqual({ accessToken: 'signed-jwt' });
    });

    it('should throw if loginDto is missing password', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(mockUser);
      // @ts-expect-error
      await expect(service.login({ email: 'test@example.com' })).rejects.toThrow();
    });

    it('should throw if loginDto is missing email', async () => {
      // @ts-expect-error
      await expect(service.login({ password: 'Password1!' })).rejects.toThrow();
    });

    it('should throw UnauthorizedException if user password is undefined', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce({ ...mockUser, password: undefined as any });
      await expect(service.login({ email: 'test@example.com', password: 'Password1!' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is null', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(null as unknown as User);
      await expect(service.login({ email: 'notfound@example.com', password: 'Password1!' }))
        .rejects.toThrow(UnauthorizedException);
    });

  });

  describe('validateGoogleUser', () => {
    it('should create new user if not exist', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(undefined as unknown as User);
      jest.spyOn(usersService, 'create').mockResolvedValueOnce(mockUser);
      const result = await service.validateGoogleUser({ displayName: 'Test', email: 'test@example.com', password: 'Password1!' });
      expect(result).toEqual(mockUser);
    });

    it('should return existing user', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValueOnce(mockUser);
      const result = await service.validateGoogleUser({ displayName: 'Test', email: 'test@example.com', password: 'Password1!' });
      expect(result).toEqual(mockUser);
    });

    it('should throw if googleUser is missing email', async () => {
      // @ts-expect-error
      await expect(service.validateGoogleUser({ displayName: 'Test', password: 'Password1!' })).rejects.toThrow();
    });

    it('should throw if googleUser is undefined', async () => {
      // @ts-expect-error
      await expect(service.validateGoogleUser(undefined)).rejects.toThrow();
    });
  });

  describe('signAccessToken', () => {
    it('should sign access token', async () => {
      const payload = { userId: 'user-id', email: 'test@example.com' };
      const result = await service.signAccessToken(payload);
      expect(result).toBe('signed-jwt-async');
    });
  });
});