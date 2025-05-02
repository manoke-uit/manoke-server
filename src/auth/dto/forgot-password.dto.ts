import { ApiProperty, PartialType } from "@nestjs/swagger";
import { LoginDto } from "./login.dto";

export class ForgotPasswordDto {
    @ApiProperty({ description: 'New password' })
    email: string;
}