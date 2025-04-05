import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { PayLoadType } from './payload.type';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService, private jwtService : JwtService) {}
    async signup(createUserDto: CreateUserDto) : Promise<User>{
        return this.usersService.create(createUserDto);
    }
    async login(loginDto: LoginDto) : Promise<{ accessToken: string }> {
        // Implement your login logic here
        // For example, you can validate the user credentials and return a JWT token
        const user = await this.usersService.findByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid email');
        }
        // Compare the password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        

        // Generate a JWT token and return it
        const payload : PayLoadType = {userId: user.id, email: user.email};
        if (user.adminSecret) {
            payload.adminSecret = user.adminSecret; // Include adminSecret if it exists
        }
        return { accessToken: this.jwtService.sign(payload) };
    }
}
