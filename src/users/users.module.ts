import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Import the TypeOrmModule and specify the User entity
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export the UsersService so it can be used in other modules
})
export class UsersModule {}
