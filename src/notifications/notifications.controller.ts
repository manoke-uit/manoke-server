import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin-guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  // @UseGuards(JwtAdminGuard)
  @Post('sendNotificationToUser')
  async sendNotificationToUser(@Body() createNotificationDto: CreateNotificationDto) {
    await this.notificationsService.sendNotificationToUser(createNotificationDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Notification sent successfully.',
    };
  }

  // @UseGuards(JwtAdminGuard)
  @Post('sendNotificationToAllUser')
  async sendNotificationToAllUser(@Body() body: { title: string, description: string }) {
    await this.notificationsService.sendNotificationToAllUser(body.title, body.description)
    return {
      statusCode: HttpStatus.OK,
      message: 'Notification sent successfully.',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiQuery({ name: 'userId', required: true })
  getUserNotifications(@Query('userId') userId: string) {
    return this.notificationsService.getAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  @ApiQuery({ name: 'userId', required: true })
  getUnreadCount(@Query('userId') userId: string) {
    return this.notificationsService.countUnread(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @UseGuards(JwtAdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
