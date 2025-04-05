import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { Song } from "src/songs/entities/song.entity";
import { User } from "src/users/entities/user.entity";

export class CreatePlaylistDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsUUID('4')
    user: User; // @IsUUID() in dto

    @IsArray()
    @IsUUID('4', { each: true })
    songs: Song[]; // @IsArray() in dto
}
