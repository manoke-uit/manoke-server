import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';
import { GoogleGuard } from './guards/google-guard';
import { responseHelper } from 'helpers/response.helper';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService : AuthService) {}

    @Post('signup')
    @HttpCode(201)
    async signup(@Body() createUserDto: CreateUserDto) : Promise<User> {
        const signupUser = await this.authService.signup(createUserDto);
        if (!signupUser) {
            throw new Error('User creation failed');
        }
        return signupUser;
    }

    @Post('login')
    async login(@Body() loginDto : LoginDto) : Promise<{ accessToken: string }> {
        return this.authService.login(loginDto);
    }

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
        const payload = {email: user.email, userId: user.id};
        const accessToken = await this.authService.signAccessToken(payload);
        // redirect to frontend later
        res.redirect(`http://localhost:3000/auth/success?accessToken=${accessToken}`);

    }
}
