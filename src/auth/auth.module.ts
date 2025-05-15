import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './strategies/jwt-strategy';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google-strategy';
import { FirebaseService } from 'src/firebase-admin/firebase.service';
import { FirebaseAdminProvider } from 'src/firebase-admin/firebase-admin.provider';
import { FirebaseAdminModule } from 'src/firebase-admin/firebase-admin.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Playlist } from 'src/playlists/entities/playlist.entity';
import { Song } from 'src/songs/entities/song.entity';
import { OtpService } from '../otp/otp.service';

@Module({
  imports: [
    PassportModule, 
    FirebaseAdminModule, 
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }), // set up secret and sign options for JWT in module
    }), 
    UsersModule, 
    TypeOrmModule.forFeature([User])
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy, OtpService], // register AuthService and JwtService as providers, strategy is also a provider => need to provide config module so that config service can be used inside jwt strategy
  controllers: [AuthController],
  exports: [AuthService], // Export AuthService and JwtModule for use in other modules
})
export class AuthModule {}
