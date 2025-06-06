import { Test, TestingModule } from '@nestjs/testing';
import { TempStoreUserService } from './temp-store-user.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

describe('TempStoreUserService', () => {
  let service: TempStoreUserService;
  const otpToken = 'otp-token';
  const user: CreateUserDto = {
    displayName: 'Test',
    email: 'test@example.com',
    password: 'Password1!',
  } as any;
  const email = 'test@example.com';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TempStoreUserService],
    }).compile();

    service = module.get<TempStoreUserService>(TempStoreUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save and get temp user', () => {
    service.saveTempUser(otpToken, user);
    const result = service.getTempUser(otpToken);
    expect(result).toEqual(user);
  });

  it('should return undefined for non-existing temp user', () => {
    const result = service.getTempUser('invalid-token');
    expect(result).toBeUndefined();
  });

  it('should save and get temp email', () => {
    service.saveTempEmail(otpToken, email);
    const result = service.getTempEmail(otpToken);
    expect(result).toBe(email);
  });

  it('should return undefined for non-existing temp email', () => {
    const result = service.getTempEmail('invalid-token');
    expect(result).toBeUndefined();
  });

  it('should delete temp user', () => {
    service.saveTempUser(otpToken, user);
    service.deleteTempUser(otpToken);
    const result = service.getTempUser(otpToken);
    expect(result).toBeUndefined();
  });

  it('should delete temp email', () => {
    service.saveTempEmail(otpToken, email);
    service.deleteTempEmail(otpToken);
    const result = service.getTempEmail(otpToken);
    expect(result).toBeUndefined();
  });
});