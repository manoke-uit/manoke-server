import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { Comment } from './entities/comment.entity';
import { Friend } from 'src/friends/entities/friend.entity';
import { PostsService } from 'src/posts/posts.service';
import { Score } from 'src/scores/entities/score.entity';
import { FriendsService } from 'src/friends/friends.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Comment, Post, Friend, Score])],
  controllers: [CommentsController],
  providers: [CommentsService, PostsService, FriendsService],
})
export class CommentsModule {}
