import { Transform } from "class-transformer";
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { User } from "src/users/entities/user.entity";

export class CreateNotificationDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsDateString()
    @IsOptional() // default value is Date.now()
    @Transform(({ value }) => {
            const [day, month, year] = value.split('/');
            return `${year}-${month}-${day}`;
    })
    createdAt: string; 

    @IsBoolean()
    @IsOptional() // default value is false
    isRead?: boolean; 

    @IsNotEmpty()
    @IsUUID('4')
    user: User;
}
