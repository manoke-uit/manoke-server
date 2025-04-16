import { Transform } from "class-transformer";
import { FriendStatus } from "../entities/friend.entity";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateFriendDto {
    @IsUUID('4')
    @IsNotEmpty()
    @ApiProperty({ description: 'ID of the user who sent the friend request' })
    receiverId: string; // @IsUUID() in dto

    @IsNotEmpty()
    @IsEnum(FriendStatus)
    @IsOptional()
    @ApiProperty({ enum: FriendStatus, description: 'Friendship status' })
    status: FriendStatus

    @IsOptional()
    @IsDateString()
    @Transform(({ value }) => {
        const [day, month, year] = value.split('/');
        return `${year}-${month}-${day}`;
    })
    @ApiProperty({ required: false, description: 'Friendship creation date' })
    createdAt?: string; // @IsDateString() in dto
}
