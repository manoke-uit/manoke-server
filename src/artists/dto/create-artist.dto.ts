import { Song } from "src/songs/entities/song.entity";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";

export class CreateArtistDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsString()
    @IsUrl()
    imageUrl?: string;

    @IsNumber()
    @IsOptional()
    popularity?: number;  
    
    @IsArray()
    @IsUUID('4', { each: true })
    songs: Song[]; // @IsArray() in entity' 
}
