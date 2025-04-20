import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
// import { firebaseAdmin } from '../firebase-admin/firebase-admin.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { FirebaseService } from 'src/firebase-admin/firebase.service';
import { FirebaseAdminProvider } from 'src/firebase-admin/firebase-admin.provider';
import { FirebaseAdminModule } from 'src/firebase-admin/firebase-admin.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), FirebaseAdminModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService]
})
export class NotificationsModule {}
