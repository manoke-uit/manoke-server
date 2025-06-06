import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Score } from 'src/scores/entities/score.entity';
import { User } from 'src/users/entities/user.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository, DeleteResult } from 'typeorm';

const mockPostRepository = () => ({
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(),
});
const mockScoreRepository = () => ({
  findOneBy: jest.fn(),
});
const mockUserRepository = () => ({
  findOneBy: jest.fn(),
});
const mockCommentRepository = () => ({
  findBy: jest.fn(),
});

describe('PostsService', () => {
  let service: PostsService;
  let postRepository: ReturnType<typeof mockPostRepository>;
  let scoreRepository: ReturnType<typeof mockScoreRepository>;
  let userRepository: ReturnType<typeof mockUserRepository>;
  let commentRepository: ReturnType<typeof mockCommentRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(Post), useFactory: mockPostRepository },
        { provide: getRepositoryToken(Score), useFactory: mockScoreRepository },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: getRepositoryToken(Comment), useFactory: mockCommentRepository },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postRepository = module.get(getRepositoryToken(Post));
    scoreRepository = module.get(getRepositoryToken(Score));
    userRepository = module.get(getRepositoryToken(User));
    commentRepository = module.get(getRepositoryToken(Comment));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPost', () => {
    it('should create and return a post', async () => {
      const dto = { scoreId: 'score1', userId: 'user1', description: 'desc', createdAt: undefined };
      const user = { id: 'user1' } as User;
      const score = { id: 'score1' } as Score;
      const savedPost = {
        id: 'post1',
        user,
        score,
        description: 'desc',
        createdAt: new Date(),
        comments: [],
      } as Post;

      scoreRepository.findOneBy.mockResolvedValue(score);
      userRepository.findOneBy.mockResolvedValue(user);
      postRepository.save.mockResolvedValue(savedPost);

      const result = await service.createPost(dto as any);
      expect(result).toEqual(savedPost);
      expect(postRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        user, score, description: 'desc', comments: []
      }));
    });

    it('should create a post with provided createdAt', async () => {
      const now = new Date();
      const dto = { scoreId: 'score1', userId: 'user1', description: 'desc', createdAt: now.toISOString() };
      const user = { id: 'user1' } as User;
      const score = { id: 'score1' } as Score;
      const savedPost = {
        id: 'post1',
        user,
        score,
        description: 'desc',
        createdAt: now,
        comments: [],
      } as Post;

      scoreRepository.findOneBy.mockResolvedValue(score);
      userRepository.findOneBy.mockResolvedValue(user);
      postRepository.save.mockResolvedValue(savedPost);

      const result = await service.createPost(dto as any);
      expect(result).toEqual(savedPost);
      expect(postRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        user, score, description: 'desc', comments: [], createdAt: expect.any(Date)
      }));
    });

    it('should throw if score not found', async () => {
      scoreRepository.findOneBy.mockResolvedValue(null);
      await expect(service.createPost({ scoreId: 'x', userId: 'y', description: 'z' } as any))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw if user not found', async () => {
      scoreRepository.findOneBy.mockResolvedValue({ id: 'score1' });
      userRepository.findOneBy.mockResolvedValue(null);
      await expect(service.createPost({ scoreId: 'score1', userId: 'userX', description: 'z' } as any))
        .rejects.toThrow(NotFoundException);
    });

    it('should set createdAt to now if not provided', async () => {
      const dto = { scoreId: 'score1', userId: 'user1', description: 'desc' };
      const user = { id: 'user1' } as User;
      const score = { id: 'score1' } as Score;
      scoreRepository.findOneBy.mockResolvedValue(score);
      userRepository.findOneBy.mockResolvedValue(user);
      postRepository.save.mockImplementation(async (post) => post);

      const result = await service.createPost(dto as any);
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const posts = [
        { id: '1', description: 'a', createdAt: new Date(), user: {}, score: {}, comments: [] },
        { id: '2', description: 'b', createdAt: new Date(), user: {}, score: {}, comments: [] }
      ] as unknown as Post[];
      postRepository.find.mockResolvedValue(posts);
      const result = await service.findAll();
      expect(result).toBe(posts);
      expect(postRepository.find).toHaveBeenCalledWith(expect.objectContaining({
        relations: expect.any(Array),
        order: { createdAt: 'DESC' }
      }));
    });

    it('should return empty array if no posts', async () => {
      postRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      const post = { id: '1', description: 'a', createdAt: new Date(), user: {}, score: {}, comments: [] } as unknown as Post;
      postRepository.findOne.mockResolvedValue(post);
      const result = await service.findOne('1');
      expect(result).toBe(post);
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: expect.any(Array)
      });
    });

    it('should return null if post not found', async () => {
      postRepository.findOne.mockResolvedValue(null);
      const result = await service.findOne('notfound');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return the post', async () => {
      const post = {
        id: '1',
        user: { id: 'user0' },
        score: { id: 'score0' },
        comments: [],
        description: 'old',
        createdAt: new Date()
      } as unknown as Post;
      const user = { id: 'user1' } as User;
      const score = { id: 'score1' } as Score;
      const comments = [{ id: 'c1' }] as Comment[];
      postRepository.findOneBy.mockResolvedValue(post);
      userRepository.findOneBy.mockResolvedValue(user);
      scoreRepository.findOneBy.mockResolvedValue(score);
      commentRepository.findBy.mockResolvedValue(comments);
      postRepository.save.mockResolvedValue({ ...post, user, score, comments });

      const dto = { userId: 'user1', scoreId: 'score1', description: 'desc', createdAt: new Date().toISOString(), commentIds: ['c1'] };
      const result = await service.update('1', 'user1', dto as any);
      expect(result).toMatchObject({ user, score, comments });
    });

    it('should update only description', async () => {
      const post = {
        id: '1',
        user: { id: 'user1' },
        score: { id: 'score1' },
        comments: [],
        description: 'old',
        createdAt: new Date()
      } as unknown as Post;
      postRepository.findOneBy.mockResolvedValue(post);
      userRepository.findOneBy.mockResolvedValue({ id: 'user1' });
      postRepository.save.mockResolvedValue({ ...post, description: 'new' });

      const dto = { description: 'new' };
      const result = await service.update('1', 'user1', dto as any);
      expect(result.description).toBe('new');
    });

    it('should update createdAt', async () => {
      const post = {
        id: '1',
        user: { id: 'user1' },
        score: { id: 'score1' },
        comments: [],
        description: 'old',
        createdAt: new Date()
      } as unknown as Post;
      postRepository.findOneBy.mockResolvedValue(post);
      userRepository.findOneBy.mockResolvedValue({ id: 'user1' });
      postRepository.save.mockImplementation(async (p) => p);

      const newDate = new Date('2023-01-01T00:00:00.000Z');
      const dto = { createdAt: newDate.toISOString() };
      const result = await service.update('1', 'user1', dto as any);
      expect(result.createdAt).toEqual(newDate);
    });

    it('should throw if post not found', async () => {
      postRepository.findOneBy.mockResolvedValue(null);
      await expect(service.update('1', 'user1', {} as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw if user not found', async () => {
      postRepository.findOneBy.mockResolvedValue({
        id: '1',
        user: { id: 'user1' },
        score: { id: 'score1' },
        comments: [],
        description: 'old',
        createdAt: new Date()
      } as unknown as Post);
      userRepository.findOneBy.mockResolvedValue(null);
      await expect(service.update('1', 'user1', { userId: 'userX' } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw if score not found', async () => {
      postRepository.findOneBy.mockResolvedValue({
        id: '1',
        user: { id: 'user1' },
        score: { id: 'score1' },
        comments: [],
        description: 'old',
        createdAt: new Date()
      } as unknown as Post);
      userRepository.findOneBy.mockResolvedValue({ id: 'user1' });
      scoreRepository.findOneBy.mockResolvedValue(null);
      await expect(service.update('1', 'user1', { scoreId: 'scoreX' } as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw if comments not found', async () => {
      postRepository.findOneBy.mockResolvedValue({
        id: '1',
        user: { id: 'user1' },
        score: { id: 'score1' },
        comments: [],
        description: 'old',
        createdAt: new Date()
      } as unknown as Post);
      userRepository.findOneBy.mockResolvedValue({ id: 'user1' });
      commentRepository.findBy.mockResolvedValue([]);
      await expect(service.update('1', 'user1', { commentIds: ['cX'] } as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      const deleteResult = { affected: 1 } as DeleteResult;
      postRepository.delete.mockResolvedValue(deleteResult);
      const result = await service.remove('1');
      expect(result).toBe(deleteResult);
      expect(postRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should return affected 0 if post does not exist', async () => {
      const deleteResult = { affected: 0 } as DeleteResult;
      postRepository.delete.mockResolvedValue(deleteResult);
      const result = await service.remove('notfound');
      expect(result).toBe(deleteResult);
      expect(postRepository.delete).toHaveBeenCalledWith('notfound');
    });
  });

  // Additional edge case tests
  describe('edge cases', () => {
    it('should update user if userId is not provided in dto', async () => {
      const post = {
        id: '1',
        user: { id: 'user1' },
        score: { id: 'score1' },
        comments: [],
        description: 'old',
        createdAt: new Date()
      } as unknown as Post;
      const user = { id: 'user1' } as User;
      postRepository.findOneBy.mockResolvedValue(post);
      userRepository.findOneBy.mockResolvedValue(user);
      postRepository.save.mockResolvedValue({ ...post, user });

      const dto = { description: 'keep' };
      const result = await service.update('1', 'user1', dto as any);
      expect(result.user).toEqual(user);
    });

    it('should not update comments if commentIds is not provided', async () => {
      const post = {
        id: '1',
        user: { id: 'user1' },
        score: { id: 'score1' },
        comments: [],
        description: 'old',
        createdAt: new Date()
      } as unknown as Post;
      userRepository.findOneBy.mockResolvedValue({ id: 'user1' });
      postRepository.findOneBy.mockResolvedValue(post);
      postRepository.save.mockResolvedValue(post);

      const dto = { description: 'keep' };
      const result = await service.update('1', 'user1', dto as any);
      expect(result.comments).toEqual([]);
    });
  });
});
