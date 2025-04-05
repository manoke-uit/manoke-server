import { Transform } from "class-transformer";
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";
import { Song } from "src/songs/entities/song.entity";
import { User } from "src/users/entities/user.entity";

export class CreateScoreDto {
    @IsNotEmpty()
    @IsUrl()
    audioUrl: string;

    @IsNotEmpty()
    @IsNumber()
    finalScore: number; // @IsNumber() in dto

    @IsDateString()
    @IsOptional() // default value is Date.now()
    @Transform(({ value }) => {
        const [day, month, year] = value.split('/');
        return `${year}-${month}-${day}`;
    })
    createdAt?: string; // @IsDateString() in dto

    @IsUUID('4')
    @IsNotEmpty()
    user: User; // @IsUUID() in dto

    @IsUUID('4')
    @IsNotEmpty()
    song: Song; // @IsUUID() in dto
}
