import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Transform } from "class-transformer";
import { IsArray, IsDate, IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, IsUrl, IsUUID } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'User display name' })
    displayName: string; // @IsString() in dto
    
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ description: 'User email address' })
    email: string; // @IsEmail() in dto

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false, description: 'Admin secret for user creation' })
    adminSecret?: string; // @IsString() in dto
    
    @IsStrongPassword({ minLength: 8, minUppercase: 1, minLowercase: 1, minNumbers: 1, minSymbols: 1 }) // check password strength
    @IsNotEmpty()
    @ApiProperty({ description: 'User password' })
    password: string; // @IsString() in dto

    @IsOptional()
    @IsUrl()
    @ApiProperty({ required: false, description: 'User profile image URL' })
    imageUrl?: string; // @IsUrl() in dto

    @IsOptional()
    @IsDateString()
    @Transform(({ value }) => {
        const [day, month, year] = value.split('/');
        return `${year}-${month}-${day}`;
    })
    @ApiProperty({ required: false, description: 'User creation date' })
    createdAt?: string; // @IsDateString() in dto

    @IsOptional()
    @IsUUID('4', { each: true })
    @IsArray()
    @ApiProperty({ required: false, description: 'User notifications' })
    notificationIds?: string[]; // @IsArray() in dto
    
    @IsOptional()
    @IsUUID('4', { each: true })
    @IsArray()
    @ApiProperty({ required: false, description: 'User playlists' })
    playlistIds?: string[]; // @IsArray() in dto

    @IsOptional()
    @IsUUID('4', { each: true })
    @IsArray()
    @ApiProperty({ required: false, description: 'User scores' })
    scoreIds?: string[]; // @IsArray() in dto

    @IsOptional()
    @IsUUID('4', { each: true })
    @IsArray()
    @ApiProperty({ required: false, description: 'User karaokes' })
    karaokeIds?: string[]; // @IsArray() in dto
}
