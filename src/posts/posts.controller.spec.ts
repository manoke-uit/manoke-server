import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  const mockPost = {
    id: 'post-id',
    description: 'Test post',
    createdAt: new Date(),
    user: { id: 'user-id', adminSecret: 'admin-secret' },
    score: { id: 'score-id' },
    comments: [],
  };

  const mockPostsService = {
    createPost: jest.fn().mockResolvedValue(mockPost),
    findAll: jest.fn().mockResolvedValue([mockPost]),
    findOne: jest.fn().mockResolvedValue(mockPost),
    update: jest.fn().mockResolvedValue({ ...mockPost, description: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        { provide: PostsService, useValue: mockPostsService },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const dto: CreatePostDto = {
        description: 'Test post',
        scoreId: 'score-id',
      };
      const req = { user: { userId: 'user-id' } };
      const result = await controller.create(dto, req);
      expect(service.createPost).toHaveBeenCalledWith({ ...dto, userId: 'user-id' });
      expect(result).toEqual(mockPost);
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockPost]);
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      const result = await controller.findOne('post-id');
      expect(service.findOne).toHaveBeenCalledWith('post-id');
      expect(result).toEqual(mockPost);
    });
  });

  describe('update', () => {
    it('should update a post if authorized', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockPost as any);
      const dto: UpdatePostDto = { description: 'Updated' };
      const req = { user: { userId: 'user-id', adminSecret: 'admin-secret' } };
      const result = await controller.update('post-id', dto, req);
      expect(service.update).toHaveBeenCalledWith('post-id', 'user-id', dto);
      expect(result).toEqual({ ...mockPost, description: 'Updated' });
    });

    it('should return 404 if post not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);
      const dto: UpdatePostDto = { description: 'Updated' };
      const req = { user: { userId: 'user-id', adminSecret: 'admin-secret' } };
      const result = await controller.update('not-found', dto, req);
      expect(result).toEqual({
        message: 'Post not found',
        statusCode: 404,
      });
    });

    it('should return 403 if not authorized', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce({
        ...mockPost,
        user: { id: 'other-user', adminSecret: 'other-secret' },
      } as any);
      const dto: UpdatePostDto = { description: 'Updated' };
      const req = { user: { userId: 'user-id', adminSecret: 'admin-secret' } };
      const result = await controller.update('post-id', dto, req);
      expect(result).toEqual({
        message: 'You are not authorized to update this post',
        statusCode: 403,
      });
    });
  });

  describe('remove', () => {
    it('should remove a post if authorized', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockPost as any);
      const req = { user: { userId: 'user-id', adminSecret: 'admin-secret' } };
      const result = await controller.remove('post-id', req);
      expect(service.remove).toHaveBeenCalledWith('post-id');
      expect(result).toEqual({ affected: 1 });
    });

    it('should return 404 if post not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(null);
      const req = { user: { userId: 'user-id', adminSecret: 'admin-secret' } };
      const result = await controller.remove('not-found', req);
      expect(result).toEqual({
        message: 'Post not found',
        statusCode: 404,
      });
    });

    it('should return 403 if not authorized', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce({
        ...mockPost,
        user: { id: 'other-user', adminSecret: 'other-secret' },
      } as any);
      const req = { user: { userId: 'user-id', adminSecret: 'admin-secret' } };
      const result = await controller.remove('post-id', req);
      expect(result).toEqual({
        message: 'You are not authorized to delete this post',
        statusCode: 403,
      });
    });
  });
});
