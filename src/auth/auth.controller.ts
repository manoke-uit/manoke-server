import { Body, Controller, Get, HttpCode, NotFoundException, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
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
import { TempStoreUserModule } from './temp-store-user/temp-store-user.module';
import { OtpService } from './otp/otp.service';
import { TempStoreUserService } from './temp-store-user/temp-store-user.service';
import { Response } from 'express';


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly otpService: OtpService,
        private readonly tempStoreUserService: TempStoreUserService
    ) { }
    private newUserDto: CreateUserDto;
    // private email: string;

    @Post('signup')
    @HttpCode(201)
    async signup(@Body() createUserDto: CreateUserDto) {
        // this.newUserDto = createUserDto;
        const signupUser = await this.authService.signup(createUserDto);
        if (!signupUser) {
            throw new Error('User creation failed');
        }
        const otpToken = await this.otpService.getToken(createUserDto.email);
        if (!otpToken) {
            throw new NotFoundException("OTP Token not found!")
        }
        await this.tempStoreUserService.saveTempUser(otpToken, createUserDto)
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
            // changePasswordDto.verifyNewPassword
        );
    }

    @Post('forgot-password')
    async forgotPassword(@Body() body: { email: string }) {
        const sendVerification = await this.authService.sendVerificationEmail(body.email, true);
        const otpToken = await this.otpService.getToken(body.email);
        if (!otpToken) {
            throw new NotFoundException("OTP Token not found!")
        }
        await this.tempStoreUserService.saveTempEmail(otpToken, body.email)
        return sendVerification;
    }

    @Post('reset-password')
    async resetPassword(@Body() body: { email: string; newPassword: string, verifyNewPassword: string }) {
        return this.authService.resetPassword(body.email, body.newPassword, body.verifyNewPassword);
    }

    @Post('confirm-verification')
    @HttpCode(200)
    async confirmVerification(
        @Body() body: { email: string, otp: string },
        newUserDto: CreateUserDto
    ) {
        const otpToken = await this.otpService.getToken(body.email);
        if (!otpToken) {
            throw new NotFoundException("OTP Token not found!")
        }

        const userDto = await this.tempStoreUserService.getTempUser(otpToken);
        const email = await this.tempStoreUserService.getTempEmail(otpToken);
        console.log(email)
        if (userDto) {
            // throw new NotFoundException("User DTO not found!")
            await this.tempStoreUserService.deleteTempUser(otpToken);
            newUserDto = userDto;
            console.log(newUserDto)
            return await this.authService.confirmVerification(body.otp, newUserDto);
        } else if (email) {
            await this.tempStoreUserService.deleteTempEmail(otpToken);
            console.log(email);
            return await this.authService.confirmVerification(body.otp, newUserDto);
        }
    }


    // remove guard
    @Get('google/login')
    async googleLogin(
    @Res() res: Response,
    @Query('redirect_url') redirectUrl: string,
    ) {
    res.cookie('redirect_url', redirectUrl, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // only HTTPS in prod
        sameSite: 'lax',
    });

    return res.redirect('/auth/google');
    }

   // add pure passport entry point
    @Get('google')
    @UseGuards(GoogleGuard)
    async googleAuth() {
    }

    // google -> callback -> client
    @Get('google/callback')
    @UseGuards(GoogleGuard)
    async googleCallback(@Req() req: any, @Res() res: Response) {
    const user = req.user;
    const redirect_url =
        req.cookies.redirect_url || 'http://localhost:3000/auth/success';

    const payload = { email: user.email, userId: user.id };
    const accessToken = await this.authService.signAccessToken(payload);

    res.clearCookie('redirect_url');
    return res.redirect(`${redirect_url}?accessToken=${accessToken}`);
    }

}
