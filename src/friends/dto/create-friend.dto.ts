import { Transform } from "class-transformer";
import { FriendStatus } from "../entities/friend.entity";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class CreateFriendDto {
    @IsUUID('4')
    @IsNotEmpty()
    userId_1: string; // @IsUUID() in dto

    @IsNotEmpty()
    @IsUUID('4')
    userId_2: string; // @IsUUID() in dto

    @IsNotEmpty()
    @IsEnum(FriendStatus)
    status: FriendStatus

    @IsOptional()
    @IsDateString()
    @Transform(({ value }) => {
        const [day, month, year] = value.split('/');
        return `${year}-${month}-${day}`;
    })
    createdAt?: string; // @IsDateString() in dto
}
