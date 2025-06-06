import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from 'src/firebase-admin/firebase.service';
import { OtpService } from './otp/otp.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { PayLoadType } from './payload.type';

// Mock toàn bộ module 'bcryptjs' và 'nodemailer'
// Điều này đảm bảo rằng các hàm được xuất từ các module này sẽ là các hàm mock của Jest.
jest.mock('bcryptjs', () => ({
  compare: jest.fn(), // Mock hàm `compare` của bcryptjs
  hash: jest.fn(),    // Mock hàm `hash` của bcryptjs
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({ // Mock `createTransport` để trả về một đối tượng có hàm `sendMail`
    sendMail: jest.fn(), // Mock hàm `sendMail` của transporter
  }),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository;
  let mockUsersService;
  let mockJwtService;
  let mockOtpService;
  let mockNodemailerTransporter; // Tham chiếu đến mock transporter được trả về bởi nodemailer.createTransport

  beforeEach(async () => {
    // Thiết lập các biến môi trường cần thiết cho `AuthService`
    // Đặc biệt quan trọng cho nodemailer transporter setup và JWT secret
    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_USER = 'testuser';
    process.env.SMTP_PASS = 'testpass';
    process.env.SMTP_FROM = 'noreply@test.com';
    process.env.JWT_SECRET = 'test_secret'; // Secret key cho JWT

    // Reset và định nghĩa lại các mock cho mỗi bài kiểm thử để đảm bảo tính độc lập
    mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    mockJwtService = {
      sign: jest.fn(),
      signAsync: jest.fn(),
    };
    mockOtpService = {
      generateOtpToken: jest.fn(),
      decodeOtpToken: jest.fn(),
      getToken: jest.fn(),
      verifyOtpToken: jest.fn(),
    };

    // Lấy tham chiếu đến mock transporter từ nodemailer.createTransport
    // Điều này cho phép chúng ta kiểm soát và kiểm thử `sendMail` sau này
    mockNodemailerTransporter = nodemailer.createTransport('');

    // Tạo TestingModule của NestJS
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User), // Sử dụng getRepositoryToken để cung cấp mock cho TypeORM Repository
          useValue: mockUserRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: OtpService,
          useValue: mockOtpService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // Sau mỗi bài kiểm thử, xóa tất cả các mock để tránh ảnh hưởng đến các bài kiểm thử khác
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Bài kiểm thử cơ bản: Đảm bảo AuthService được định nghĩa
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Test cases for sendVerificationEmail ---
  describe('sendVerificationEmail', () => {
    const testEmail = 'test@example.com';
    const testOtpCode = { otp: '123456', email: testEmail, expiry: 3600 };
    const testOtpToken = 'mockOtpToken';

    beforeEach(() => {
      // Thiết lập hành vi mock cho các hàm được gọi trong sendVerificationEmail
      mockOtpService.generateOtpToken.mockResolvedValue(testOtpToken);
      mockOtpService.decodeOtpToken.mockResolvedValue(testOtpCode);
      mockNodemailerTransporter.sendMail.mockResolvedValue({}); // Giả lập gửi email thành công
    });

    it('should send a verification email for signup', async () => {
      const result = await service.sendVerificationEmail(testEmail);

      // Kiểm tra xem các hàm mock đã được gọi đúng cách
      expect(mockOtpService.generateOtpToken).toHaveBeenCalledWith(testEmail);
      expect(mockOtpService.decodeOtpToken).toHaveBeenCalledWith(testOtpToken);
      expect(mockNodemailerTransporter.sendMail).toHaveBeenCalledTimes(1); // Đảm bảo sendMail được gọi 1 lần

      // Kiểm tra nội dung email và người nhận
      const sendMailArgs = mockNodemailerTransporter.sendMail.mock.calls[0][0];
      expect(sendMailArgs.to).toEqual(testEmail);
      expect(sendMailArgs.subject).toEqual('Verify your email');
      expect(sendMailArgs.html).toContain(testOtpCode.otp); // Kiểm tra mã OTP trong nội dung HTML
      expect(result).toEqual({ message: 'Verification sent, please check your email to continue' });
    });

    it('should send a verification email for password reset', async () => {
      const result = await service.sendVerificationEmail(testEmail, true);

      expect(mockOtpService.generateOtpToken).toHaveBeenCalledWith(testEmail);
      expect(mockOtpService.decodeOtpToken).toHaveBeenCalledWith(testOtpToken);
      expect(mockNodemailerTransporter.sendMail).toHaveBeenCalledTimes(1);

      const sendMailArgs = mockNodemailerTransporter.sendMail.mock.calls[0][0];
      expect(sendMailArgs.to).toEqual(testEmail);
      expect(sendMailArgs.subject).toEqual('Reset your password');
      expect(sendMailArgs.html).toContain(testOtpCode.otp);
      expect(result).toEqual({ message: 'Verification sent, please check your email to continue' });
    });

    it('should throw an error if sending email fails', async () => {
      // Giả lập lỗi khi gửi email
      mockNodemailerTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(service.sendVerificationEmail(testEmail)).rejects.toThrow(
        'Unable to send verification email. Please try again later.',
      );
      expect(mockNodemailerTransporter.sendMail).toHaveBeenCalledTimes(1);
    });
  });

  // --- Test cases for confirmVerification ---
  describe('confirmVerification', () => {
    const testOtp = '123456';
    const testCreateUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      password: 'password123',
      displayName: 'New User',
      imageUrl: null,
      adminSecret: "",
    };
    const testOtpToken = 'mockOtpToken';

    beforeEach(() => {
      // Mặc định mock getToken trả về một token và verifyOtpToken trả về true
      mockOtpService.getToken.mockResolvedValue(testOtpToken);
      mockOtpService.verifyOtpToken.mockResolvedValue(true);
      mockUsersService.create.mockResolvedValue({}); // Giả lập user creation thành công
    });

    it('should confirm verification and create user for signup', async () => {
      const result = await service.confirmVerification(testOtp, testCreateUserDto, false);

      expect(mockOtpService.getToken).toHaveBeenCalledWith(testCreateUserDto.email);
      expect(mockOtpService.verifyOtpToken).toHaveBeenCalledWith(testOtpToken, testOtp);
      expect(mockUsersService.create).toHaveBeenCalledWith(testCreateUserDto); // Đảm bảo user được tạo
      expect(result).toEqual({ success: true, message: 'Verified sign-up successfully.' });
    });

    it('should return success for password reset (no createUserDto)', async () => {
      const result = await service.confirmVerification(testOtp, null, true);

      // Khi isReset là true và createUserDto là null, các hàm của usersService và getToken/verifyOtpToken không được gọi
      expect(mockOtpService.getToken).not.toHaveBeenCalled();
      expect(mockOtpService.verifyOtpToken).not.toHaveBeenCalled();
      expect(mockUsersService.create).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false, message: 'Resetting password verified successfully.' });
    });

    it('should throw BadRequestException if OTP Token does not exist for signup', async () => {
      mockOtpService.getToken.mockResolvedValue(null); // Giả lập không tìm thấy OTP token

      await expect(service.confirmVerification(testOtp, testCreateUserDto, false)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.confirmVerification(testOtp, testCreateUserDto, false)).rejects.toThrow(
        'Cannot confirm verification: OTP Token doesn\'t exist!',
      );
    });

    it('should throw BadRequestException if OTP verification fails for signup', async () => {
      mockOtpService.verifyOtpToken.mockResolvedValue(false); // Giả lập OTP verification thất bại

      await expect(service.confirmVerification(testOtp, testCreateUserDto, false)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.confirmVerification(testOtp, testCreateUserDto, false)).rejects.toThrow(
        'Cannot confirm verification: Invalid OTP or OTP expired.', // Giả sử verifyOtpToken ném lỗi này
      );
    });

    it('should throw BadRequestException if user creation fails after verification', async () => {
      mockUsersService.create.mockRejectedValue(new Error('Database error')); // Giả lập lỗi khi tạo user

      await expect(service.confirmVerification(testOtp, testCreateUserDto, false)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.confirmVerification(testOtp, testCreateUserDto, false)).rejects.toThrow(
        'Cannot confirm verification: Database error',
      );
    });
  });

  // --- Test cases for changePassword ---
  describe('changePassword', () => {
    const userId = 'user123';
    const oldPassword = 'oldPassword123';
    const newPassword = 'newPassword123';
    const hashedPassword = 'hashedOldPassword';
    const hashedNewPassword = 'hashedNewPassword';

    const mockUser: User = {
      id: userId,
      email: 'user@example.com',
      password: hashedPassword,
      displayName: 'Test User',
      imageUrl: null,
      adminSecret: ,
      createdAt: new Date(),
      updatedAt: new Date(),
      favoriteSongs: [],
      favoriteArtists: [],
      favoritePlaylists: [],
      followedArtists: [],
      followedUsers: [],
      playlists: [],
      albums: [],
      songs: []
    };

    beforeEach(() => {
      // Mặc định tìm thấy người dùng
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      // Mặc định bcrypt.compare trả về true (old password đúng)
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      // Mặc định bcrypt.hash trả về new hashed password
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedNewPassword);
      mockUserRepository.save.mockResolvedValue(mockUser); // Giả lập lưu thành công
    });

    it('should successfully change password', async () => {
      const result = await service.changePassword(userId, oldPassword, newPassword);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(bcrypt.compare).toHaveBeenCalledWith(oldPassword, hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ password: hashedNewPassword }), // Đảm bảo password mới được lưu
      );
      expect(result).toEqual({ message: 'Password successfully changed' });
    });

    it('should throw an error if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null); // Giả lập không tìm thấy người dùng

      await expect(service.changePassword(userId, oldPassword, newPassword)).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw an error if old password is incorrect', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Giả lập old password sai

      await expect(service.changePassword(userId, oldPassword, newPassword)).rejects.toThrow(
        'Old password is incorrect',
      );
    });

    // Các bài kiểm thử cho các trường hợp đã comment out trong mã gốc, nếu bạn muốn bật lại chúng:
    // it('should throw an error if new password and verified password do not match', async () => {
    //   await expect(service.changePassword(userId, oldPassword, newPassword, 'mismatch')).rejects.toThrow(
    //     'New password and verified password do not match',
    //   );
    // });

    // it('should throw an error if new password is same as old password', async () => {
    //   (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Giả lập new password trùng với old password
    //   await expect(service.changePassword(userId, oldPassword, oldPassword)).rejects.toThrow(
    //     'New password must be different from the old password',
    //   );
    // });
  });

  // --- Test cases for resetPassword ---
  describe('resetPassword', () => {
    const testEmail = 'reset@example.com';
    const newPassword = 'newResetPassword';
    const verifyNewPassword = 'newResetPassword';
    const hashedPassword = 'hashedOldPassword';
    const hashedNewPassword = 'hashedNewPassword';

    const mockUser: User = {
      id: 'user123',
      email: testEmail,
      password: hashedPassword,
      displayName: 'Test User',
      imageUrl: null,
      adminSecret: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      favoriteSongs: [],
      favoriteArtists: [],
      favoritePlaylists: [],
      followedArtists: [],
      followedUsers: [],
      playlists: [],
      albums: [],
      songs: []
    };

    beforeEach(() => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedNewPassword);
      mockUserRepository.save.mockResolvedValue(mockUser);
    });

    it('should successfully reset password', async () => {
      const result = await service.resetPassword(testEmail, newPassword, verifyNewPassword);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: testEmail } });
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ password: hashedNewPassword }),
      );
      expect(result).toEqual({ message: 'Password has been reset successfully' });
    });

    it('should throw an error if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(testEmail, newPassword, verifyNewPassword)).rejects.toThrow(
        'Cannot reset password!:User not found',
      );
    });

    it('should throw an error if new password and verified password do not match', async () => {
      await expect(service.resetPassword(testEmail, newPassword, 'mismatchPassword')).rejects.toThrow(
        'Cannot reset password!:New password and verified password do not match',
      );
    });

    it('should throw an error if saving user fails', async () => {
      mockUserRepository.save.mockRejectedValue(new Error('DB save error'));

      await expect(service.resetPassword(testEmail, newPassword, verifyNewPassword)).rejects.toThrow(
        'Cannot reset password!:DB save error',
      );
    });
  });

  // --- Test cases for signup ---
  describe('signup', () => {
    const createUserDto: CreateUserDto = {
      email: 'signup@example.com',
      password: 'password123',
      displayName: 'Signup User',
      imageUrl: null,
      adminSecret: null,
    };

    beforeEach(() => {
      mockUserRepository.findOne.mockResolvedValue(null); // Mặc định user chưa tồn tại
      // Giả lập sendVerificationEmail thành công
      jest.spyOn(service, 'sendVerificationEmail').mockResolvedValue({
        message: 'Verification sent, please check your email to continue',
      });
    });

    it('should successfully initiate signup for a new user', async () => {
      const result = await service.signup(createUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(service.sendVerificationEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(result).toEqual({ message: 'Verification sent, please check your email to continue' });
    });

    it('should throw ForbiddenException if email already exists in DB', async () => {
      mockUserRepository.findOne.mockResolvedValue({ email: createUserDto.email }); // User đã tồn tại

      await expect(service.signup(createUserDto)).rejects.toThrow(ForbiddenException);
      await expect(service.signup(createUserDto)).rejects.toThrow('Email already existed');
    });

    it('should throw an error if sendVerificationEmail fails', async () => {
      (service.sendVerificationEmail as jest.Mock).mockRejectedValue(new Error('Email service error'));

      await expect(service.signup(createUserDto)).rejects.toThrow('Cannot sign up new user: Error: Email service error');
    });
  });

  // --- Test cases for login ---
  describe('login', () => {
    const loginDto: LoginDto = { email: 'login@example.com', password: 'password123' };
    const hashedPassword = 'hashedPassword123';
    const mockUser: User = {
      id: 'user123',
      email: loginDto.email,
      password: hashedPassword,
      displayName: 'Login User',
      imageUrl: null,
      adminSecret: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      favoriteSongs: [],
      favoriteArtists: [],
      favoritePlaylists: [],
      followedArtists: [],
      followedUsers: [],
      playlists: [],
      albums: [],
      songs: []
    };
    const accessToken = 'mockAccessToken';

    beforeEach(() => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Mặc định password đúng
      mockJwtService.sign.mockReturnValue(accessToken); // Mặc định JWT sign trả về token
    });

    it('should successfully log in a user and return an access token', async () => {
      const result = await service.login(loginDto);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, hashedPassword);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
      }); // Kiểm tra payload
      expect(result).toEqual({ accessToken: accessToken });
    });

    it('should include adminSecret in payload if present', async () => {
      const adminUser = { ...mockUser, adminSecret: 'supersecret' };
      mockUsersService.findByEmail.mockResolvedValue(adminUser);

      await service.login(loginDto);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        userId: adminUser.id,
        email: adminUser.email,
        adminSecret: adminUser.adminSecret,
      });
    });

    it('should throw UnauthorizedException if email is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null); // Không tìm thấy user

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid email');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Password sai

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid password');
    });
  });

  // --- Test cases for validateGoogleUser ---
  describe('validateGoogleUser', () => {
    const googleUserDto: CreateUserDto = {
      email: 'google@example.com',
      displayName: 'Google User',
      password: null, // Google user thường không có password
      imageUrl: 'http://example.com/profile.jpg',
      adminSecret: null,
    };
    const mockExistingUser: User = {
      id: 'googleUser123',
      email: googleUserDto.email,
      displayName: googleUserDto.displayName,
      password: null,
      imageUrl: googleUserDto.imageUrl,
      adminSecret: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      favoriteSongs: [],
      favoriteArtists: [],
      favoritePlaylists: [],
      followedArtists: [],
      followedUsers: [],
      playlists: [],
      albums: [],
      songs: []
    };
    const mockNewUser: User = {
      id: 'newGoogleUser',
      email: googleUserDto.email,
      displayName: googleUserDto.displayName,
      password: "",
      imageUrl: googleUserDto.imageUrl,
      adminSecret: "",
      createdAt: new Date(),
      favoriteSongs: [],
      favoriteArtists: [],
      favoritePlaylists: [],
      followedArtists: [],
      followedUsers: [],
      playlists: [],
      albums: [],
      songs: []
    };

    it('should return existing user if found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockExistingUser); // User đã tồn tại

      const result = await service.validateGoogleUser(googleUserDto);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(googleUserDto.email);
      expect(mockUsersService.create).not.toHaveBeenCalled(); // Không gọi create
      expect(result).toEqual(mockExistingUser);
    });

    it('should create and return a new user if not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null); // User chưa tồn tại
      mockUsersService.create.mockResolvedValue(mockNewUser); // Giả lập tạo user mới

      const result = await service.validateGoogleUser(googleUserDto);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(googleUserDto.email);
      expect(mockUsersService.create).toHaveBeenCalledWith(googleUserDto); // Đảm bảo gọi create
      expect(result).toEqual(mockNewUser);
    });

    it('should throw an error if findByEmail fails', async () => {
      mockUsersService.findByEmail.mockRejectedValue(new Error('DB error'));

      await expect(service.validateGoogleUser(googleUserDto)).rejects.toThrow('DB error');
    });

    it('should throw an error if create user fails', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockRejectedValue(new Error('Create user error'));

      await expect(service.validateGoogleUser(googleUserDto)).rejects.toThrow('Create user error');
    });
  });

  // --- Test cases for signAccessToken ---
  describe('signAccessToken', () => {
    const payload: PayLoadType = { userId: '1', email: 'test@example.com' };
    const expectedToken = 'mockAccessToken';

    beforeEach(() => {
      mockJwtService.signAsync.mockResolvedValue(expectedToken);
    });

    it('should sign an access token successfully', async () => {
      const result = await service.signAccessToken(payload);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload);
      expect(result).toEqual(expectedToken);
    });

    it('should throw an error if signing fails', async () => {
      mockJwtService.signAsync.mockRejectedValue(new Error('Signing error'));

      await expect(service.signAccessToken(payload)).rejects.toThrow('Signing error');
    });
  });
});
