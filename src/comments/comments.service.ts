import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
      @InjectRepository(Post)
      private postRepository: Repository<Post>, 
      @InjectRepository(Comment)
      private commentRepository: Repository<Comment>, 
      @InjectRepository(User)
      private userRepository: Repository<User>, 
    ) {}
  
    async createComment(createCommentDto: CreateCommentDto): Promise<Comment> {
      const newComment = new Comment();
      const post = await this.postRepository.findOneBy({id: createCommentDto.postId});
      const user = await this.userRepository.findOneBy({id: createCommentDto.userId});
  
      if (!post) {
        throw new NotFoundException('Cannot find any scores!');
      }
      if (!user) {
        throw new NotFoundException('Cannot find user!');
      }
  
      newComment.user = user;
      newComment.post = post;
      newComment.comment = createCommentDto.comment;
      newComment.createdAt = createCommentDto.createdAt ? new Date(createCommentDto.createdAt) : new Date();
      
  
      return await this.commentRepository.save(newComment);
    }
  
    async findAll() {
      return await this.commentRepository.find({
        relations: ['user', 'post'],
      });
    }
  
    async findOne(id: string): Promise<Comment | null> {
      return await this.commentRepository.findOne({
        where: { id },
        relations: ['user', 'post'], // Include relations if needed
      });
    }
  
    async update(id: string, UpdateCommentDto: UpdateCommentDto): Promise<UpdateResult> {
      return await this.commentRepository.update(id, UpdateCommentDto);
    }
  
    async remove(id: string): Promise<DeleteResult> {
      return await this.commentRepository.delete(id);
    }
}
