import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
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
    const comments = await this.commentRepository.findBy({post: { id: newPost.id } });

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
    newPost.comments = comments;
    

    return await this.postRepository.save(newPost);
  }

  async findAll() {
    return await this.postRepository.find({
      relations: ['user', 'score'],
    });
  }

  async findOne(id: string): Promise<Post | null> {
    return await this.postRepository.findOne(
      { where: { id }, relations: ['user', 'score'] } // Include relations if needed
    );
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<UpdateResult> {
    return await this.postRepository.update(id, updatePostDto);
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.postRepository.delete(id);
  }
}
