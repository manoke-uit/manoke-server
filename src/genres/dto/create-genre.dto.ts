import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateGenreDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Genre name', required: true })
    name: string; // @IsString() in dto

    @IsOptional()
    @IsUUID('4', { each: true })
    @ApiProperty({ description: 'Genre song', required: false })
    @IsArray()
    songIds?: string[]; // @IsArray() in dto
}
