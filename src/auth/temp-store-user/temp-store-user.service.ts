import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
// import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class TempStoreUserService {
  private tempUsers = new Map<string, { user: CreateUserDto }>();
  private tempEmails = new Map<string, { email: string }>();

  // Lưu user và email tạm thời với OTP token
  saveTempUser(otpToken: string, user: CreateUserDto) {
    this.tempUsers.set(otpToken, { user });
  }

  saveTempEmail(otpToken: string, email: string) {
    this.tempEmails.set(otpToken, { email });
  }

  // Lấy user tạm thời dựa trên OTP token
  getTempUser(otpToken: string): CreateUserDto | undefined {
    const tempData = this.tempUsers.get(otpToken);
    return tempData?.user;
  }

  // Lấy email tạm thời dựa trên OTP token
  getTempEmail(otpToken: string): string | undefined {
    const tempEmails = this.tempEmails.get(otpToken);
    return tempEmails?.email;
  }

  // Xóa dữ liệu tạm thời dựa trên OTP token
  deleteTempUser(otpToken: string) {
    this.tempUsers.delete(otpToken);
  }

  deleteTempEmail(otpToken: string) {
    this.tempEmails.delete(otpToken);
  }
}
