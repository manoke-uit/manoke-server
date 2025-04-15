import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsUUID, ValidatorConstraint } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateArtistDto {
    @IsOptional()
    @IsString()
    spotifyId: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Artist name' })
    name: string;
    
    @IsString()
    @IsUrl()
    @IsOptional()
    @ApiProperty({ required: false, description: 'Artist image URL' })
    imageUrl?: string;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ required: false, description: 'Artist popularity point' })
    popularity?: number;  
    
    @IsArray()
    @IsUUID('4', { each: true })
    @IsOptional()
    @ApiProperty({ required: false, description: 'Artist songs IDs' })
    songIds: string[]; // @IsArray() in entity' 
}
