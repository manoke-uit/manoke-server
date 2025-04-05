import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService : AuthService) {}

    @Post('signup')
    @HttpCode(201)
    async signup(@Body() createUserDto: CreateUserDto) : Promise<User> {
        return this.authService.signup(createUserDto);
    }

    @Post('login')
    async login(@Body() loginDto : LoginDto) : Promise<{ accessToken: string }> {
        return this.authService.login(loginDto);
    }
}
