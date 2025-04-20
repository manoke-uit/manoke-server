// firebase-admin.provider.ts
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

export const FirebaseAdminProvider = {
  provide: 'FIREBASE_ADMIN',
  useFactory: (configService: ConfigService) => {
    const serviceAccount: ServiceAccount = {
      projectId: configService.get<string>('PROJECT_ID'),
      clientEmail: configService.get<string>('CLIENT_EMAIL'),
      privateKey: (configService.get<string>('PRIVATE_KEY') || '').replace(/\\n/g, '\n'),
    };

    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    return admin; // Export the entire admin module
  },
  inject: [ConfigService],
};
