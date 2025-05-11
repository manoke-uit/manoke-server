import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { Score } from 'src/scores/entities/score.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Score])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
