import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";
import { KaraokeStatus } from "../entities/karaoke.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class CreateKaraokeDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Karaoke description' })
    description: string;

    @ApiProperty({ description: 'Karaoke video URL' })
    @IsUrl()
    @IsNotEmpty()
    videoUrl: string; // @IsUrl() in dto

    @ApiProperty({ description: 'Karaoke status' })
    @IsEnum(KaraokeStatus)
    @IsOptional()
    status?: KaraokeStatus; // @IsEnum() in dto

    @IsOptional()
    @IsDateString()
    @Transform(({ value }) => {
        const [day, month, year] = value.split('/');
        return `${year}-${month}-${day}`;
    })
    @ApiProperty({ required: false, description: 'Karaoke creation date' })
    createdAt?: string; // @IsDateString() in dto

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'ID of the karaoke\'s song' })
    songId: string; // @IsArray() in dto

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'ID of the karaoke instance owner' })
    userId: string; // @IsString() in dto
}
