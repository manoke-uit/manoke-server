import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { firebaseAdminProvider } from './firebase-admin.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [firebaseAdminProvider, NotificationsService],
  // providers: [NotificationsService],
  exports: [NotificationsService]
})
export class NotificationsModule {}
