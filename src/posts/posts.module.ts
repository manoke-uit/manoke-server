import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { Score } from 'src/scores/entities/score.entity';
import { Comment } from 'src/comments/entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User, Score, Comment])],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService], // Exporting PostsService to be used in other modules
})
export class PostsModule {}
