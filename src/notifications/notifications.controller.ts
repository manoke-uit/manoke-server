import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  sendNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.sendAndSave(createNotificationDto);
  }

  @Get()
  @ApiQuery({ name: 'userId', required: true })
  getUserNotifications(@Query('userId') userId: string) {
    return this.notificationsService.getAll(userId);
  }

  @Get('unread-count')
  @ApiQuery({ name: 'userId', required: true })
  getUnreadCount(@Query('userId') userId: string) {
    return this.notificationsService.countUnread(userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
