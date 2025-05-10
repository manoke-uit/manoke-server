import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreatePostDto {
    @IsNotEmpty()
    @IsUUID('4')
    @ApiProperty({ description: 'User ID' })
    userId: string; // @IsUUID() in dto
    
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Post content' })
    description: string; // @IsString() in dto

    @IsOptional()
    @IsDateString()
    @Transform(({ value }) => {
        const [day, month, year] = value.split('/');
        return `${year}-${month}-${day}`;
    })
    @ApiProperty({ required: false, description: 'Post creation date' })
    createdAt?: string; // @IsDateString() in dto

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    @ApiProperty({ required: false, description: 'Post comments' })
    commentIds?: string[]; // @IsArray() in dto

    @IsNotEmpty()
    @IsString()
    @IsUUID('4')
    @ApiProperty({ required:false, description: 'Post score ID' })
    scoreId: string; // @IsString() in dto
}
