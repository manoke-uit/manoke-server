import { Controller, Get, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth-guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


  // see the current user
  @Get('profile')
  @UseGuards(JwtAuthGuard) // Use the JWT guard to protect this route
  getProfile(@Req() req) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    return req.user;
  }
}
