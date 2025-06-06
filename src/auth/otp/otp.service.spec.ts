import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';

describe('OtpService', () => {
  let service: OtpService;
  const email = 'test@example.com';
  const OLD_ENV = process.env;

  beforeAll(() => {
    process.env = { ...OLD_ENV, JWT_SECRET: 'testsecret' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpService],
    }).compile();

    service = module.get<OtpService>(OtpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate, store and get OTP token', async () => {
    const token = await service.generateOtpToken(email);
    expect(typeof token).toBe('string');
    const stored = await service.getToken(email);
    expect(stored).toBe(token);
  });

  it('should decode OTP token and contain otp', async () => {
    const token = await service.generateOtpToken(email);
    const decoded = await service.decodeOtpToken(token);
    expect(decoded).toHaveProperty('otp');
    expect(decoded.otp).toMatch(/^\d{6}$/);
  });

  it('should verify OTP token with correct otp', async () => {
    const token = await service.generateOtpToken(email);
    const { otp } = await service.decodeOtpToken(token);
    const isValid = await service.verifyOtpToken(token, otp);
    expect(isValid).toBe(true);
  });

  it('should not verify OTP token with wrong otp', async () => {
    const token = await service.generateOtpToken(email);
    const isValid = await service.verifyOtpToken(token, '000000');
    expect(isValid).toBe(false);
  });

  it('should clear token', async () => {
    const token = await service.generateOtpToken(email);
    await service.clearToken(email);
    const stored = await service.getToken(email);
    expect(stored).toBeNull();
  });

  it('should throw error if JWT_SECRET is not set', async () => {
    process.env.JWT_SECRET = '';
    await expect(service.generateOtpToken(email)).rejects.toThrow('JWT_SECRET is not set');
    process.env.JWT_SECRET = 'testsecret';
  });
});