import { Transform } from "class-transformer";
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";
import { Artist } from "src/artists/entities/artist.entity";
import { Playlist } from "src/playlists/entities/playlist.entity";
import { Score } from "src/scores/entities/score.entity";

export class CreateSongDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    albumTitle?: string;

    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @IsDateString()
    @IsOptional() // default value is Date.now() or can just be null 🤷🏻‍♀️
    @Transform(({ value }) => {
        const [day, month, year] = value.split('/');
        return `${year}-${month}-${day}`;
    })
    releasedDate?: string;

    @IsNumber()
    @IsOptional() // default value is 0
    duration?: number; // @IsNumber() in dto

    @IsUrl()
    //@IsNotEmpty() as for searching among Youtube and Spotify APIs, gotta be one here
    youtubeUrl: string; // @IsUrl() in dto
    
    @IsUrl()
    @IsOptional() // if can't find api generate score base on ...?
    spotifyUrl: string; // @IsUrl() in dto

    @IsOptional()
    @IsUUID('4', { each: true })
    @IsArray()
    artists?: Artist[]; // @IsArray() in dto

    @IsOptional()
    @IsUUID('4', { each: true })
    @IsArray()
    playlists?: Playlist[]; // @IsArray() in dto

    @IsOptional()
    @IsUUID('4', { each: true })
    @IsArray()
    scores?: Score[]; // @IsArray() in dto
}
