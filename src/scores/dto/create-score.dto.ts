import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";

export class CreateScoreDto {
  @IsOptional()
  audioUrl?: string;

  @IsOptional()
  finalScore?: number;

  @IsUUID()
  @IsOptional()
  userId: string;

  @IsUUID()
  songId: string;

  @IsOptional()
  @IsUUID()
  postId?: string;
}
