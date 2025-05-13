import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';
import { PlaylistsService } from 'src/playlists/playlists.service';

// import { firebaseAdmin } from './firebase-admin.config';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private readonly usersService: UsersService,
        private jwtService: JwtService,
        private firebaseService: FirebaseService,
    ) { }
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

    async generateLink(email: string, isReset?: boolean): Promise<String> {
        const actionCodeSettings = {
            url: `${process.env.APP_URL}/auth/confirm-email`,
            handleCodeInApp: true,
        };
        // console.log(createUserDto.displayName);
        try {
            if (isReset) {
                const user = this.userRepository.findOneBy({ email })
                if (!user) {
                    throw new NotFoundException('Cannot find user!')
                }

                const secretKey = process.env.JWT_SECRET;

                if (!secretKey) {
                    throw new Error("JWT_SECRET is not set")
                }

                const resetToken = jwt.sign(
                    { email },
                    secretKey, // Secret key của bạn
                    { expiresIn: '1h' } // Token hết hạn sau 1 giờ
                );

                const link = `https://localhost:3000/reset-password?token=${resetToken}`;
                return link;
            }

            else {
                await this.firebaseService.auth().getUserByEmail(email);
                const link = await this.firebaseService
                    .auth()
                    .generateEmailVerificationLink(email);

                return link;
            }
        } catch (err) {
            throw new BadRequestException("Cannot generate verification link: " + err.message);
        }
    }

    async sendVerificationEmail(email: string, isReset?: boolean) {
        try {

            const link = await this.generateLink(email, isReset);
            const subject = isReset ? 'Reset your password' : 'Verify your email';
            const body = isReset
                ? `
                <p>Hello,</p>
                <p>Please press the link below to reset your password:</p>
                <a href="${link}">${link}</a>
                <p>If you did not request, please ignore this email.</p>
              `
                : `
                <p>Hello,</p>
                <p>Please press the link below to verify your email:</p>
                <a href="${link}">${link}</a>
                <p>If you did not request, please ignore this email.</p>
              `;

            await this.transporter.sendMail({
                from: `${process.env.SMTP_FROM}`,
                to: email,
                subject: subject,
                html: body,
            });

            return { message: "Verification sent, please check your email to continue" };
        } catch (error) {
            console.error('Error sending verification email:', error);
            throw new Error('Unable to send verification email. Please try again later.');
        }
    }


    async addUserToDatabase(createUserDto: CreateUserDto) {
        try {
            await this.usersService.create(createUserDto)
            // return { success: true, message: 'Email verified successfully.' };
        } catch (err) {
            throw new BadRequestException('Cannot add user to database: ' + err.message);
        }
        //return { success: true, message: 'Email verified successfully.' };
    }

    async changePassword(userEmail: string, oldPassword: string, newPassword: string, verifyPassword: string) {
        // Lấy người dùng từ DB
        const user = await this.userRepository.findOne({ where: { email: userEmail } });
        if (!user) {
            throw new Error('User not found');
        }

        const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordCorrect) {
            throw new Error('Old password is incorrect');
        }

        if (newPassword !== verifyPassword) {
            throw new Error('New password and verified password do not match');
        }

        if (await bcrypt.compare(newPassword, user.password)) {
            throw new Error('New password must be different from the old password');
        }


        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedNewPassword;
        await this.userRepository.save(user);

        return { message: 'Password successfully changed' };
    }

    async resetPassword(token: string, newPassword: string, verifyNewPassword: string) {
        try {
            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET is not set")
            }
            const payload = jwt.verify(token, process.env.JWT_SECRET) as { email: string };

            const user = await this.userRepository.findOne({ where: { email: payload.email } });
            if (!user) {
                throw new Error('User not found');
            }

            if (newPassword !== verifyNewPassword) {
                throw new Error('New password and verified password do not match');
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            user.password = hashedNewPassword;
            await this.userRepository.save(user);

            return { message: 'Password has been reset successfully' };
        } catch (err) {
            throw new Error('Invalid or expired token');
        }
    }


    // sign up
    async signup(createUserDto: CreateUserDto) {
        try {
            const existedUserInDb = await this.userRepository.findOne(
                {
                    where: { email: createUserDto.email }
                }
            )

            if (existedUserInDb !== null) {
                throw new ForbiddenException("Email already existed")
            }

            const newUser = createUserDto;

            let existedUserInFb;
            try {
                existedUserInFb = await this.firebaseService.auth().getUserByEmail(newUser.email);
            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    existedUserInFb = await this.firebaseService.auth().createUser({
                        email: createUserDto.email,
                        password: createUserDto.password,
                        displayName: createUserDto.displayName,
                    });
                } else {
                    throw error;
                }
            }

            return this.sendVerificationEmail(newUser.email);
        } catch (error) {
            throw new Error(`Cannot sign up new user: ${error}`);
        }

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


