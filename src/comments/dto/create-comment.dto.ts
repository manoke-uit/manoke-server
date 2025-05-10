import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateCommentDto {
    @IsNotEmpty()
    @IsUUID('4')
    @ApiProperty({ description: 'User ID' })
    userId: string; // @IsUUID() in dto

    @IsString()
    @ApiProperty({ description: 'Comment text' })
    comment: string; // @IsString() in dto


    @IsOptional()
    @IsDateString()
    @Transform(({ value }) => {
        const [day, month, year] = value.split('/');
        return `${year}-${month}-${day}`;
    })
    @ApiProperty({ required: false, description: 'Karaoke creation date' })
    createdAt?: string; // @IsDateString() in dto

    @IsString()
    @ApiProperty({ description: 'Post ID' })
    @IsUUID('4')
    @IsNotEmpty()
    postId: string; // @IsUUID() in dto
}
