import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { Comment } from './entities/comment.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

const mockPost = { id: 'post-uuid', description: 'desc', createdAt: new Date() } as Post;
const mockUser = { id: 'user-uuid', displayName: 'User', email: 'user@email.com', password: 'pass', createdAt: new Date() } as User;
const mockComment = { id: 'comment-uuid', comment: 'test comment', createdAt: new Date(), user: mockUser, post: mockPost } as Comment;

describe('CommentsService', () => {
  let service: CommentsService;
  let postRepo: Repository<Post>;
  let userRepo: Repository<User>;
  let commentRepo: Repository<Comment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: getRepositoryToken(Post), useValue: { findOneBy: jest.fn(), findOne: jest.fn() } },
        { provide: getRepositoryToken(User), useValue: { findOneBy: jest.fn() } },
        { provide: getRepositoryToken(Comment), useValue: { save: jest.fn(), findOne: jest.fn(), find: jest.fn(), findOneBy: jest.fn(), delete: jest.fn() } },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    postRepo = module.get(getRepositoryToken(Post));
    userRepo = module.get(getRepositoryToken(User));
    commentRepo = module.get(getRepositoryToken(Comment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createComment', () => {
    it('should create and return a comment', async () => {
      jest.spyOn(postRepo, 'findOneBy').mockResolvedValueOnce(mockPost);
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValueOnce(mockUser);
      jest.spyOn(commentRepo, 'save').mockResolvedValueOnce(mockComment);
      jest.spyOn(commentRepo, 'findOne').mockResolvedValueOnce(mockComment);

      const dto = { postId: mockPost.id, userId: mockUser.id, comment: 'test comment' };
      const result = await service.createComment(dto as any);
      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException if post not found', async () => {
      jest.spyOn(postRepo, 'findOneBy').mockResolvedValueOnce(null);
      const dto = { postId: 'notfound', userId: mockUser.id, comment: 'test comment' };
      await expect(service.createComment(dto as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(postRepo, 'findOneBy').mockResolvedValueOnce(mockPost);
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValueOnce(null);
      const dto = { postId: mockPost.id, userId: 'notfound', comment: 'test comment' };
      await expect(service.createComment(dto as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all comments', async () => {
      jest.spyOn(commentRepo, 'find').mockResolvedValueOnce([mockComment]);
      const result = await service.findAll();
      expect(result).toEqual([mockComment]);
    });
  });

  describe('findOne', () => {
    it('should return a comment by id', async () => {
      jest.spyOn(commentRepo, 'findOne').mockResolvedValueOnce(mockComment);
      const result = await service.findOne('comment-uuid');
      expect(result).toEqual(mockComment);
    });

    it('should return null if not found', async () => {
      jest.spyOn(commentRepo, 'findOne').mockResolvedValueOnce(null);
      const result = await service.findOne('notfound');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return the comment', async () => {
      jest.spyOn(commentRepo, 'findOneBy').mockResolvedValueOnce(mockComment);
      jest.spyOn(postRepo, 'findOneBy').mockResolvedValueOnce(mockPost);
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValueOnce(mockUser);
      jest.spyOn(commentRepo, 'save').mockResolvedValueOnce(mockComment);
      jest.spyOn(commentRepo, 'findOne').mockResolvedValueOnce(mockComment);

      const dto = { postId: mockPost.id, comment: 'updated', createdAt: new Date().toISOString() };
      const result = await service.update('comment-uuid', mockUser.id, dto as any);
      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException if comment not found', async () => {
      jest.spyOn(commentRepo, 'findOneBy').mockResolvedValueOnce(null);
      await expect(service.update('notfound', mockUser.id, {} as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if post not found', async () => {
      jest.spyOn(commentRepo, 'findOneBy').mockResolvedValueOnce(mockComment);
      jest.spyOn(postRepo, 'findOneBy').mockResolvedValueOnce(null);
      const dto = { postId: 'notfound' };
      await expect(service.update('comment-uuid', mockUser.id, dto as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(commentRepo, 'findOneBy').mockResolvedValueOnce(mockComment);
      jest.spyOn(postRepo, 'findOneBy').mockResolvedValueOnce(mockPost);
      jest.spyOn(userRepo, 'findOneBy').mockResolvedValueOnce(null);
      await expect(service.update('comment-uuid', 'notfound', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a comment', async () => {
      jest.spyOn(commentRepo, 'delete').mockResolvedValueOnce({ affected: 1 } as any);
      const result = await service.remove('comment-uuid');
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('findByPost', () => {
    it('should return comments by post id', async () => {
      jest.spyOn(commentRepo, 'find').mockResolvedValueOnce([mockComment]);
      const result = await service.findByPost(mockPost.id);
      expect(result).toEqual([mockComment]);
    });
  });
});
