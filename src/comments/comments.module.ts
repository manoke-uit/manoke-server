import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { Comment } from './entities/comment.entity';
import { Friend } from 'src/friends/entities/friend.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Comment, Post, Friend])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
