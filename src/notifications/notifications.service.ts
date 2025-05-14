import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { SendNotificationDto } from './dto/send-notification.dto';
import * as firebase from 'firebase-admin';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) { }

  async sendAndSave(sendNotificationDto: SendNotificationDto) {
    if (sendNotificationDto.deviceId) {
      await firebase.messaging().send({
        notification: {
          title: sendNotificationDto.title,
          body: sendNotificationDto.description || '',
        },
        token: sendNotificationDto.deviceId,
        android: 
        { 
          priority: 'high', 
          notification: { 
            sound: 'default', 
            channelId: 'default' 
          } 
        },
        apns: {
          headers: { 'apns-priority': '10' },
          payload: {
            aps: {
              contentAvailable: true,
              sound: 'default',
            },
          },
        },
      });
    }

    return this.notificationsRepository.save({
      title: sendNotificationDto.title,
      description: sendNotificationDto.description,
      user: { id: sendNotificationDto.userId },
      isRead: false,
    });
  }

  async getAll(userId: string) {
    return this.notificationsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string) {
    await this.notificationsRepository.update(id, { isRead: true });
    return this.notificationsRepository.findOne({ where: { id } });
  }

  async countUnread(userId: string) {
    return this.notificationsRepository.count({
      where: { user: { id: userId }, isRead: false },
    });
  }

  async remove(id: string) {
    return this.notificationsRepository.delete(id);
  }
}
