import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
// import { firebaseAdmin } from '../firebase-admin/firebase-admin.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { FirebaseService } from 'src/firebase-admin/firebase.service';
import { FirebaseAdminProvider } from 'src/firebase-admin/firebase-admin.provider';
import { FirebaseAdminModule } from 'src/firebase-admin/firebase-admin.module';
import { UserDevice } from 'src/users/entities/user-device.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { PlaylistsModule } from 'src/playlists/playlists.module';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, UserDevice, User]), FirebaseAdminModule, PlaylistsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, UsersService, SupabaseStorageService],
  exports: [NotificationsService]
})
export class NotificationsModule {}
