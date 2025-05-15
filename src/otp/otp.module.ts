import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}