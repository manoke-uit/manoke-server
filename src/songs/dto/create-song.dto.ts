import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";

export class CreateSongDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Song title' })
    title: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'lyrics' })
    lyrics?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: 'Song album title' })
    albumTitle?: string;

    @IsOptional()
    @IsUrl()
    @ApiProperty({ required: false, description: 'Song album image URL' })
    imageUrl?: string;

    @IsDateString()
    @IsOptional() // default value is Date.now() or can just be null 🤷🏻‍♀️
    // @Transform(({ value }) => {
    //     const [day, month, year] = value.split('/');
    //     return `${year}-${month}-${day}`;
    // })
    @ApiProperty({ required: false, description: 'Song release date' })
    releasedDate?: Date;

    @IsNumber()
    @IsOptional() // default value is 0
    @ApiProperty({ required: false, description: 'Song duration in seconds' })
    duration?: number; // @IsNumber() in dto

    @IsUrl()
    //@IsNotEmpty() as for searching among Youtube and Spotify APIs, gotta be one here
    @ApiProperty({ description: 'Youtube URL' })
    youtubeUrl: string; // @IsUrl() in dto
    
    @IsUrl()
    @IsOptional() // if can't find api generate score base on ...?
    @ApiProperty({ required: false, description: 'Spotify URL' })
    spotifyUrl: string; // @IsUrl() in dto

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
}
