import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateNotificationDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Notification title' })
    title: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ required: false, description: 'Notification description' })
    description: string;

    @IsDateString()
    @IsOptional() // default value is Date.now()
    @Transform(({ value }) => {
        const [day, month, year] = value.split('/');
        return `${year}-${month}-${day}`;
    })
    @ApiProperty({ required: false, description: 'Notification creation date' })
    createdAt?: string;

    @IsBoolean()
    @IsOptional() // default value is false
    @ApiProperty({ required: false, description: 'Notification read status' })
    isRead?: boolean;

    @IsNotEmpty()
    @IsUUID('4')
    @IsOptional()
    @ApiProperty({ description: 'ID of the user who got the notification' })
    userId: string;

    @ApiProperty({ example: 'fcm_device_token_123', required: false })
    @IsString()
    @IsOptional()
    expoPushToken?: string; // Chỉ dùng nếu cần gửi push
}
