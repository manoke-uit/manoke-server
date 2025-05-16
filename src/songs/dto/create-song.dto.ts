import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";

export class CreateSongDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Song title' })
    title: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'lyrics' })
    lyrics: string;

    @IsUrl()
    @IsOptional() // if can't find api generate score base on ...?
    @ApiProperty({ description: 'Song Audio URL' })
    songUrl: string; // @IsUrl() in dto

    @IsOptional()
    @ApiProperty({ description: 'Song Image URL' })
    @IsUrl()
    @Transform(({ value }) => value || null)
    imageUrl?: string; // @IsUrl() in dto

    @IsOptional()
    @IsUUID('4', { each: true })
    @IsArray()
    @ApiProperty({ required: false, description: 'Artists IDs' })
    artistIds?: string[]; // @IsArray() in dto

    @IsOptional()
    @IsUUID('4', { each: true })
    @IsArray()
    @ApiProperty({ required: false, description: 'Playlists IDs' })
    playlistIds?: string[]; // @IsArray() in dto

    @IsOptional()
    @IsUUID('4', { each: true })
    @IsArray()
    @ApiProperty({ required: false, description: 'Scores IDs' })
    scoreIds?: string[]; // @IsArray() in dto

    @IsOptional()
    @IsUUID('4', { each: true })
    @IsArray()
    @ApiProperty({ required: false, description: 'Karaokes IDs' })
    karaokeIds?: string[]; // @IsArray() in dto

    @IsOptional()
    @IsUUID('4', { each: true })
    @IsArray()
    @ApiProperty({ required: false, description: 'Genres IDs' })
    genreIds?: string[]; // @IsArray() in dto
}
