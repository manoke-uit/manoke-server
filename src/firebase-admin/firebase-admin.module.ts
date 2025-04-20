// firebase-admin.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseAdminProvider } from './firebase-admin.provider';
import { FirebaseService } from './firebase.service';

@Module({
  imports: [ConfigModule],
  providers: [FirebaseAdminProvider, FirebaseService],
  exports: [FirebaseService], // Export so it can be used in other modules
})
export class FirebaseAdminModule {}
