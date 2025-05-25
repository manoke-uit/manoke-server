import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { DeleteResult, In, Repository, UpdateResult } from 'typeorm';
import { Score } from 'src/scores/entities/score.entity';
import { User } from 'src/users/entities/user.entity';
import { UpdateRequest } from 'firebase-admin/lib/auth/auth-config';
import { Comment } from 'src/comments/entities/comment.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>, 
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>, 
    @InjectRepository(User)
    private userRepository: Repository<User>, 
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async createPost(createPostDto: CreatePostDto): Promise<Post> {
  const newPost = new Post();
  const score = await this.scoreRepository.findOneBy({id: createPostDto.scoreId});
  const user = await this.userRepository.findOneBy({id: createPostDto.userId});

  if (!score) {
    throw new NotFoundException('Cannot find any scores!');
  }
  if (!user) {
    throw new NotFoundException('Cannot find user!');
  }

  newPost.user = user;
  newPost.score = score;
  newPost.description = createPostDto.description;
  newPost.createdAt = createPostDto.createdAt ? new Date(createPostDto.createdAt) : new Date();
  newPost.comments = []; // Khởi tạo mảng comments rỗng

  return await this.postRepository.save(newPost);
}

  async findAll() {
  return await this.postRepository.find({
    relations: ['user', 'score', 'score.song', 'comments', 'comments.user'],
    order: { createdAt: 'DESC' }
  });
}

  async findOne(id: string): Promise<Post | null> {
    return await this.postRepository.findOne(
      { where: { id }, relations: ['user', 'score', 'comments', 'comments.user'] } 
    );
  }

  async update(id: string, userId: string, updatePostDto: UpdatePostDto) {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (updatePostDto.userId) {
      const user = await this.userRepository.findOneBy({ id: updatePostDto.userId });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      post.user = user;
    } else {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      post.user = user;
    }
    if (updatePostDto.scoreId) {
      const score = await this.scoreRepository.findOneBy({ id: updatePostDto.scoreId });
      if (!score) {
        throw new NotFoundException('Score not found');
      }
      post.score = score;
    }
    if (updatePostDto.description) {
      post.description = updatePostDto.description;
    }
    if (updatePostDto.createdAt) {
      post.createdAt = new Date(updatePostDto.createdAt);
    }
    if (updatePostDto.commentIds) {
      const comments = await this.commentRepository.findBy({ id: In(updatePostDto.commentIds) });
      if (comments.length === 0) {
        throw new NotFoundException('No comments found');
      }
      post.comments = comments;
    }
    
   
    return await this.postRepository.save( post);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.postRepository.delete(id);
  }
}
