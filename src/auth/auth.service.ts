import { BadRequestException, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { PayLoadType } from './payload.type';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import * as nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { FirebaseAdminProvider } from 'src/firebase-admin/firebase-admin.provider';
import { FirebaseService } from 'src/firebase-admin/firebase.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { firebaseAdmin } from './firebase-admin.config';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) 
        private userRepository: Repository<User>,
        private readonly usersService: UsersService, 
        private jwtService: JwtService, 
        private firebaseService: FirebaseService,
    ) {}
    private transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true', // true nếu dùng SSL/TLS
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    } as SMTPTransport.Options
    );

    async generateVerificationLink(createUserDto: CreateUserDto): Promise<String> {
        const actionCodeSettings = {
            url: `${process.env.APP_URL}/auth/confirm-email`,
            handleCodeInApp: false,
        };

        try {
            await this.firebaseService.auth().createUser({
                    email: createUserDto.email, 
                    password: createUserDto.password, 
                    displayName: createUserDto.displayName
                }
            )

            await this.firebaseService.auth().getUserByEmail(createUserDto.email);

            const link = await this.firebaseService
                .auth()
                .generateEmailVerificationLink(createUserDto.email, actionCodeSettings);
            return link;
        } catch (err) {
            throw new BadRequestException("Cannot generate verification link: " + err.message);
        }
    }

    async sendVerificationEmail(createUserDto: CreateUserDto) {
        const email = createUserDto.email;
        console.log(createUserDto);
        // console.log(await this.firebaseService.auth().getUserByEmail(email));
        // return
        const link = await this.generateVerificationLink(createUserDto);

        await this.transporter.sendMail({
            from: `"Manoke" <${process.env.SMTP_FROM}>`,
            to: email,
            subject: 'Verify your email',
            html: `
            <p>Hello,</p>
            <p>Please press the link below to verify your email:</p>
            <a href="${link}">${link}</a>
            <p>If you did not request, please ignore this email.</p>
          `,
        });
    }

    async applyEmailVerification(createUserDto: CreateUserDto): Promise<{ success: boolean; message: string }> {
        try {
            await this.usersService.create(createUserDto)
            return { success: true, message: 'Email verified successfully.' };
        } catch (err) {
            console.error('Error verifying email:', err);
            throw new BadRequestException('Cannot verify your email: ' + err.message);
        }
    }


    // sign up
    async signup(createUserDto: CreateUserDto) {
        
        const existedUser = await this.userRepository.findOne(
            {
                where: { email: createUserDto.email }
            }
        )

        if (existedUser !== null) {
            throw new ForbiddenException("Email already existed")
        }

        const newUser = createUserDto;
        this.sendVerificationEmail(newUser);
        return { message: "Verification sent, please check your email to continue" }

    }
    // login
    async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
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
        const payload: PayLoadType = { userId: user.id, email: user.email };
        if (user.adminSecret) {
            payload.adminSecret = user.adminSecret; // Include adminSecret if it exists
        }
        return { accessToken: this.jwtService.sign(payload) };
    }
    // handle google login
    async validateGoogleUser(googleUser: CreateUserDto): Promise<User> {
        const user = await this.usersService.findByEmail(googleUser.email);
        // not exist => create a new one
        if (!user) {
            const newUser = await this.usersService.create(googleUser);
            return newUser;
        }
        // else => return the existed user
        return user;
    }
    // sign access token
    async signAccessToken(payload: PayLoadType): Promise<string> {
        return this.jwtService.signAsync(payload);
    }
}
