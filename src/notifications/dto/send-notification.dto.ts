import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({ example: 'You are invited' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'I invited you to the room!' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '1db2a8c2-...' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'fcm_device_token_123', required: false })
  @IsString()
  @IsOptional()
  deviceId?: string; // Chỉ dùng nếu cần gửi push
}
