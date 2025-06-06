import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp/otp.service';
import { TempStoreUserService } from './temp-store-user/temp-store-user.service';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { ExecutionContext } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let otpService: OtpService;
  let tempStoreUserService: TempStoreUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
            changePassword: jest.fn(),
            sendVerificationEmail: jest.fn(),
            resetPassword: jest.fn(),
            confirmVerification: jest.fn(),
            signAccessToken: jest.fn(),
          },
        },
        {
          provide: OtpService,
          useValue: {
            getToken: jest.fn(),
          },
        },
        {
          provide: TempStoreUserService,
          useValue: {
            saveTempUser: jest.fn(),
            saveTempEmail: jest.fn(),
            getTempUser: jest.fn(),
            getTempEmail: jest.fn(),
            deleteTempUser: jest.fn(),
            deleteTempEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    otpService = module.get<OtpService>(OtpService);
    tempStoreUserService = module.get<TempStoreUserService>(TempStoreUserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should signup user and save temp user', async () => {
      const dto: CreateUserDto = {
        displayName: 'Test',
        email: 'test@example.com',
        password: 'Password1!',
      } as any;
      (authService.signup as jest.Mock).mockResolvedValue({ id: 1 });
      (otpService.getToken as jest.Mock).mockResolvedValue('otp-token');
      (tempStoreUserService.saveTempUser as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.signup(dto);
      expect(authService.signup).toHaveBeenCalledWith(dto);
      expect(otpService.getToken).toHaveBeenCalledWith(dto.email);
      expect(tempStoreUserService.saveTempUser).toHaveBeenCalledWith('otp-token', dto);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('login', () => {
    it('should login and return accessToken', async () => {
      const dto: LoginDto = { email: 'test@example.com', password: 'Password1!' };
      (authService.login as jest.Mock).mockResolvedValue({ accessToken: 'token' });

      const result = await controller.login(dto);
      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ accessToken: 'token' });
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      const dto = { oldPassword: 'old', newPassword: 'newPassword1!' };
      const req = { user: { userId: '1' } } as any;
      (authService.changePassword as jest.Mock).mockResolvedValue({ message: 'Password successfully changed' });

      const result = await controller.changePassword(dto as any, req);
      expect(authService.changePassword).toHaveBeenCalledWith('1', 'old', 'newPassword1!');
      expect(result).toEqual({ message: 'Password successfully changed' });
    });
  });

  describe('forgotPassword', () => {
    it('should send verification email and save temp email', async () => {
      (authService.sendVerificationEmail as jest.Mock).mockResolvedValue({ message: 'sent' });
      (otpService.getToken as jest.Mock).mockResolvedValue('otp-token');
      (tempStoreUserService.saveTempEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.forgotPassword({ email: 'test@example.com' });
      expect(authService.sendVerificationEmail).toHaveBeenCalledWith('test@example.com', true);
      expect(otpService.getToken).toHaveBeenCalledWith('test@example.com');
      expect(tempStoreUserService.saveTempEmail).toHaveBeenCalledWith('otp-token', 'test@example.com');
      expect(result).toEqual({ message: 'sent' });
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValue({ message: 'Password has been reset successfully' });

      const result = await controller.resetPassword({ email: 'test@example.com', newPassword: 'new', verifyNewPassword: 'new' });
      expect(authService.resetPassword).toHaveBeenCalledWith('test@example.com', 'new', 'new');
      expect(result).toEqual({ message: 'Password has been reset successfully' });
    });
  });

  describe('confirmVerification', () => {
    it('should confirm verification for userDto', async () => {
      (otpService.getToken as jest.Mock).mockResolvedValue('otp-token');
      (tempStoreUserService.getTempUser as jest.Mock).mockResolvedValue({ email: 'test@example.com' });
      (tempStoreUserService.deleteTempUser as jest.Mock).mockResolvedValue(undefined);
      (authService.confirmVerification as jest.Mock).mockResolvedValue({ success: true });

      const result = await controller.confirmVerification({ email: 'test@example.com', otp: '123456' }, {} as any);
      expect(authService.confirmVerification).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should confirm verification for email', async () => {
      (otpService.getToken as jest.Mock).mockResolvedValue('otp-token');
      (tempStoreUserService.getTempUser as jest.Mock).mockResolvedValue(undefined);
      (tempStoreUserService.getTempEmail as jest.Mock).mockResolvedValue('test@example.com');
      (tempStoreUserService.deleteTempEmail as jest.Mock).mockResolvedValue(undefined);
      (authService.confirmVerification as jest.Mock).mockResolvedValue({ success: true });

      const result = await controller.confirmVerification({ email: 'test@example.com', otp: '123456' }, {} as any);
      expect(authService.confirmVerification).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });
});