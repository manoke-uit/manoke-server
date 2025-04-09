import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";

export class CreateScoreDto {
    @IsNotEmpty()
    @IsUrl()
    @ApiProperty({description: 'URL of the audio file'})
    audioUrl: string;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({description: 'Score value'})
    finalScore: number; // @IsNumber() in dto

    @IsDateString()
    @IsOptional() // default value is Date.now()
    @Transform(({ value }) => {
        const [day, month, year] = value.split('/');
        return `${year}-${month}-${day}`;
    })
    @ApiProperty({required: false, description: 'Score creation date'})
    createdAt?: string; // @IsDateString() in dto

    @IsUUID('4')
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({description: 'ID of the user who created the score'})
    userId: string; // @IsUUID() in dto

    @IsUUID('4')
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({description: 'ID of the song associated with the score'})
    songId: String; // @IsUUID() in dto
}
