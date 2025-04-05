import { Exclude, Transform } from "class-transformer";
import { IsArray, IsDate, IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword, IsUrl, IsUUID } from "class-validator";
import { Notification } from "src/notifications/entities/notification.entity";
import { Playlist } from "src/playlists/entities/playlist.entity";
import { Score } from "src/scores/entities/score.entity";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    displayName: string; // @IsString() in dto
    
    @IsEmail()
    @IsNotEmpty()
    email: string; // @IsEmail() in dto

    @IsOptional()
    @IsString()
    adminSecret?: string; // @IsString() in dto
    
    @IsStrongPassword({ minLength: 8, minUppercase: 1, minLowercase: 1, minNumbers: 1, minSymbols: 1 }) // check password strength
    @IsNotEmpty()
    password: string; // @IsString() in dto

    @IsOptional()
    @IsUrl()
    imageUrl?: string; // @IsUrl() in dto

    @IsOptional()
    @IsDateString()
    @Transform(({ value }) => {
        const [day, month, year] = value.split('/');
        return `${year}-${month}-${day}`;
    })
    createdAt?: string; // @IsDateString() in dto

    @IsArray()
    @IsUUID('4', { each: true })
    @IsOptional()
    notifications?: Notification[]; // @IsArray() in dto

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    playlists?: Playlist[]; // @IsArray() in dto

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    scores?: Score[]; // @IsArray() in dto
}
