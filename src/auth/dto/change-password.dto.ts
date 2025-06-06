import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty()
    oldPassword: string;

    @IsStrongPassword({ minLength: 8, minUppercase: 1, minLowercase: 1, minNumbers: 1, minSymbols: 1 }) // check password strength
    @IsNotEmpty()
    @IsString()
    newPassword: string;

        // @IsStrongPassword({ minLength: 8, minUppercase: 1, minLowercase: 1, minNumbers: 1, minSymbols: 1 }) // check password strength
        // // @IsNotEmpty()
        // @IsString()
        // verifyNewPassword?: string;
}