import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    return this.notificationsService.sendAndSave(sendNotificationDto);
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
