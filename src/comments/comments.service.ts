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
  
    async createComment(createCommentDto: CreateCommentDto): Promise<Comment | null> {
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

      const savedComment = await this.commentRepository.save(newComment);
      return await this.commentRepository.findOne({
        where: { id: savedComment.id },
        relations: ['user', 'post'],
      });
  
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
  
    async update(id: string, userId: string,updateCommentDto: UpdateCommentDto){
      const comment = await this.commentRepository.findOneBy({id});
      if (!comment) {
        throw new NotFoundException('Cannot find any scores!');
      }
      if(updateCommentDto.postId){
        const post = await this.postRepository.findOneBy({id: updateCommentDto.postId});
        if (!post) {
          throw new NotFoundException('Cannot find any scores!');
        }
        comment.post = post;
      }
      if (userId){
        const user = await this.userRepository.findOneBy({id: userId});
        if (!user) {
          throw new NotFoundException('Cannot find user!');
        }
        comment.user = user;
      }
      comment.comment = updateCommentDto.comment ?? comment.comment;
      comment.createdAt = updateCommentDto.createdAt ? new Date(updateCommentDto.createdAt) : new Date();

      const updatedComment = await this.commentRepository.save(comment);
      return await this.commentRepository.findOne({
        where: { id: updatedComment.id },
        relations: ['user', 'post'],
      });
    }
  
    async remove(id: string): Promise<DeleteResult> {
      return await this.commentRepository.delete(id);
    }

    async findByPost(postId: string): Promise<Comment[]> {
    return await this.commentRepository.find({
        where: { post: { id: postId } },
        relations: ['user'],
        order: {
          createdAt: 'DESC'
        }
      });
    }
}
