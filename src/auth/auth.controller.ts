import { Body, Controller, Get, HttpCode, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';
import { GoogleGuard } from './guards/google-guard';
import { responseHelper } from 'src/helpers/response.helper';
import * as nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    private newUserDto: CreateUserDto;

    @Post('signup')
    @HttpCode(201)
    async signup(@Body() createUserDto: CreateUserDto) {
        this.newUserDto = createUserDto;
        const signupUser = await this.authService.signup(createUserDto);
        if (!signupUser) {
            throw new Error('User creation failed');
        }
        return signupUser;
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard) 
    @Post('change-password')
    async changePassword(
        @Body() changePasswordDto: ChangePasswordDto,
        @Req() req: RequestWithUser
    ) {
        return this.authService.changePassword(
            req.user.userId, 
            changePasswordDto.oldPassword, 
            changePasswordDto.newPassword, 
            changePasswordDto.verifyNewPassword
        );
    }

    @Post('forgot-password')
    async forgotPassword(@Body() body: { email: string }) {
    return this.authService.sendVerificationEmail(body.email, true);
}

    @Post('reset-password')
    async resetPassword(@Body() body: { token: string; newPassword: string, verifyNewPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword, body.verifyNewPassword);
}

    // @Post('confirm-email')
    // @HttpCode(200)
    // async addUserToDatabase(newUserDto: CreateUserDto = this.newUserDto) {
    //     newUserDto = this.newUserDto;
    //     console.log(newUserDto)
    //     return await this.authService.addUserToDatabase(newUserDto);
    // }
    

    @Get('google/login')
    @UseGuards(GoogleGuard)
    async googleLogin() {
        // Initiates the Google authentication process
    }
    @Get('google/callback')
    @UseGuards(GoogleGuard)
    async googleLoginCallback(@Req() req: any, @Res() res: any) {
        //return this.authService.googleLogin(user);
        const user = req.user;

        // need to sign the access token
        const payload = { email: user.email, userId: user.id };
        const accessToken = await this.authService.signAccessToken(payload);
        // redirect to frontend later
        res.redirect(`http://localhost:3000/auth/success?accessToken=${accessToken}`);

    }
}
