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
    @IsOptional()
    videoUrl: string; // @IsUrl() in dto

    @IsOptional()
    @IsDateString()
    @Transform(({ value }) => {
        const [day, month, year] = value.split('/');
        return `${year}-${month}-${day}`;
    })
    @ApiProperty({ required: false, description: 'Karaoke creation date' })
    createdAt?: string; // @IsDateString() in dto

    @IsEnum(KaraokeStatus)
    @IsOptional()
    @ApiProperty({ enum: KaraokeStatus, required: false, description: 'Karaoke status' })
    status?: KaraokeStatus; // @IsEnum(KaraokeStatus) in dto

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'ID of the karaoke\'s song' })
    songId: string; // @IsArray() in dto

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'ID of the karaoke instance\'s owner, id can be taken from auth so OPTIONAL' })
    userId: string; // @IsString() in dto
}
