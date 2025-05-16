import { Module } from '@nestjs/common';
import { TempStoreUserService } from './temp-store-user.service';

@Module({
  providers: [TempStoreUserService]
})
export class TempStoreUserModule {}
