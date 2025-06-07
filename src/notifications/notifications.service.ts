import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import * as firebase from 'firebase-admin';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UserDevice } from 'src/users/entities/user-device.entity';
import { User } from 'src/users/entities/user.entity';
import Expo, { ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

@Injectable()
export class NotificationsService {
  private expo: Expo;

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(UserDevice)
    private userDevicesRepository: Repository<UserDevice>,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {
    this.expo = new Expo();
  }

  async sendPushNotification(
    recipientTokens: string[],
    title: string,
    body: string,
    sound: 'default' | null = 'default'
  ) {
    const messages: ExpoPushMessage[] = [];

    for (let pushToken of recipientTokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.warn(`Push token ${pushToken} is not a valid Expo push token.`);
        continue; // Bỏ qua token không hợp lệ
      }

      messages.push({
        to: pushToken, sound, title, body
      })
    }

    // let chunks = this.expo.chunkPushNotifications(messages);
    let tickets: ExpoPushTicket[] = [];

    for (const message of messages) {
      try {
        let ticketChunk = await this.expo.sendPushNotificationsAsync([message]);
        console.log(`Sent chunk of notifications. Tickets: ${JSON.stringify(ticketChunk)}`);
        tickets.push(...ticketChunk);
      } catch (error) {
        throw new BadRequestException(`Error sending push notification chunk: ${error.message}`, error.stack);
        // Có thể lưu lỗi vào DB hoặc thông báo cho admin
      }
    }
  }

  async sendNotificationToUser(createNotificationDto: CreateNotificationDto) {
    const userDevices = await this.userDevicesRepository.find({
      where: { user: { id: createNotificationDto.userId } },
      select: ['expoPushToken'],
      relations: ['user']
    });

    console.log(userDevices);

    const tokens = userDevices.map(userDevice => userDevice.expoPushToken);

    if (tokens.length === 0) {
      throw new NotFoundException(`No push tokens found for user ${createNotificationDto.userId}. Notification not sent.`);

    }
    const notificationSent = new Notification();
    const user = await this.usersRepository.findOneBy({id: createNotificationDto.userId })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    notificationSent.title = createNotificationDto.title;
    notificationSent.description = createNotificationDto.description;
    notificationSent.user = user; // Liên kết với đối tượng User
    await this.notificationsRepository.save(notificationSent);

    await this.sendPushNotification(tokens, createNotificationDto.title, createNotificationDto.description);
  }

  async sendNotificationToAllUser(title: string, description: string) {
    const userDevices = await this.userDevicesRepository.find({
      relations: ['user']
    });
    const tokens = userDevices.map(userDevice => userDevice.expoPushToken);

    if (tokens.length === 0) {
      throw new NotFoundException(`No push tokens found for all users. Notification not sent.`);
    }

    const uniqueUsers = new Map<string, User>();
    for (const device of userDevices) {
      if (device.user) {
        console.log(device.user.id, device.user)
        uniqueUsers.set(device.user.id, device.user);
      }
    }

    console.log(uniqueUsers)

    const notificationsToSave: Notification[] = [];
    for (const user of uniqueUsers.values()) {
      const notificationSent = new Notification();
      notificationSent.title = title;
      notificationSent.description = description;
      notificationSent.user = user;
      // Thêm các trường khác nếu có
      notificationsToSave.push(notificationSent);
    }
    await this.notificationsRepository.save(notificationsToSave);

    await this.sendPushNotification(tokens, title, description);
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
