import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './strategies/jwt-strategy';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google-strategy';

@Module({
  imports: [PassportModule, JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get('JWT_SECRET'),
      signOptions: { expiresIn: '1h' },
    }), // set up secret and sign options for JWT in module

  }), UsersModule],
  providers: [AuthService, JwtStrategy, GoogleStrategy], // register AuthService and JwtService as providers, strategy is also a provider => need to provide config module so that config service can be used inside jwt strategy
  controllers: [AuthController],
  exports: [AuthService], // Export AuthService and JwtModule for use in other modules
})
export class AuthModule {}
