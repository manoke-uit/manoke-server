// firebase.service.ts
import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';


@Injectable()
export class FirebaseService {
  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: typeof admin,
  ) {}



  // auth related methods
  auth() {
    return this.firebaseAdmin.auth();
  }

  // Example method to use auth()
  async getUser(uid: string) {
    const userRecord = await this.firebaseAdmin.auth().getUser(uid);
    return userRecord;
  }

  // Example method to use Firestore
  async addDocument(collection: string, data: Record<string, any>) {
    const docRef = await this.firebaseAdmin.firestore().collection(collection).add(data);
    return docRef.id;
  }

  // async applyActionCode(oobCode: string) {
  //   try {
  //     // Sử dụng Firebase Admin SDK để áp dụng action code (xác minh email hoặc thay đổi mật khẩu)
  //     await this.firebaseAdmin.applyActionCode(oobCode);
  //     return { message: 'Email verified successfully.' }; // Thông báo xác minh thành công
  //   } catch (error) {
  //     throw new Error('Error applying action code: ' + error.message); // Xử lý lỗi nếu có
  //   }
  // }

}
