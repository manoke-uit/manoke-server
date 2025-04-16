import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from './entities/friend.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Friend, User])],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService]
})
export class FriendsModule {}


// G:\Learning Stuffs\University\HK4\Mobile Programming\Project\manoke-server\src\@types\express\index.d.ts