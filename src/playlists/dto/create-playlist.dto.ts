import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";

export class CreatePlaylistDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Playlist name' })
    title: string;

    @IsOptional()
    @IsUrl()
    @ApiProperty({ required: false, description: 'Playlist image URL' })
    imageUrl?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false, description: 'Playlist description' })
    description?: string;

    @IsOptional()
    // @IsString()
    @IsBoolean()
    @ApiProperty({ required: false, description: 'Playlist publicity' })
    isPublic?: boolean;

    @IsOptional()
    @IsUUID('4')
    @IsOptional()
    @ApiProperty({ description: 'ID of the user who created the playlist' })
    userId?: string; // @IsUUID() in dto

    @IsArray()
    @IsUUID('4', { each: true })
    @IsOptional()
    @ApiProperty({ required: false, description: 'Songs IDs' })
    songIds: string[]; // @IsArray() in dto
}
