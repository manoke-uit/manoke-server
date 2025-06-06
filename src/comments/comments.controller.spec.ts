import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin-guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  const mockComment = {
    id: 'comment-uuid',
    comment: 'test comment',
    createdAt: new Date(),
    user: { id: 'user-uuid', adminSecret: 'admin-secret' },
    post: { id: 'post-uuid' },
  };

  const mockCommentsService = {
    createComment: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByPost: jest.fn(),
  };

  const mockRequest = {
    user: { userId: 'user-uuid', adminSecret: 'admin-secret' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        { provide: CommentsService, useValue: mockCommentsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(JwtAdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.createComment with userId from req', async () => {
      const dto: CreateCommentDto = {
        comment: 'test',
        postId: 'post-uuid',
      };
      mockCommentsService.createComment.mockResolvedValue(mockComment);

      const result = await controller.create(dto, mockRequest as any);

      expect(mockCommentsService.createComment).toHaveBeenCalledWith({
        ...dto,
        userId: 'user-uuid',
      });
      expect(result).toBe(mockComment);
    });
  });

  describe('findAll', () => {
    it('should return all comments', async () => {
      mockCommentsService.findAll.mockResolvedValue([mockComment]);
      const result = await controller.findAll();
      expect(result).toEqual([mockComment]);
      expect(mockCommentsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a comment by id', async () => {
      mockCommentsService.findOne.mockResolvedValue(mockComment);
      const result = await controller.findOne('comment-uuid');
      expect(result).toBe(mockComment);
      expect(mockCommentsService.findOne).toHaveBeenCalledWith('comment-uuid');
    });
  });

  describe('update', () => {
    it('should update comment if user is owner', async () => {
      mockCommentsService.findOne.mockResolvedValue(mockComment);
      mockCommentsService.update.mockResolvedValue({ ...mockComment, comment: 'updated' });

      const dto: UpdateCommentDto = { comment: 'updated' };
      const result = await controller.update('comment-uuid', dto, mockRequest as any);

      expect(mockCommentsService.update).toHaveBeenCalledWith('comment-uuid', 'user-uuid', dto);
      expect(result).toEqual({ ...mockComment, comment: 'updated' });
    });

    it('should return 403 if user is not owner or admin', async () => {
      mockCommentsService.findOne.mockResolvedValue({
        ...mockComment,
        user: { id: 'other-user', adminSecret: 'other-secret' },
      });
      const dto: UpdateCommentDto = { comment: 'updated' };
      const result = await controller.update('comment-uuid', dto, mockRequest as any);
      expect((result as any).statusCode).toBe(403);
    });
  });

  describe('remove', () => {
    it('should remove comment if user is owner', async () => {
      mockCommentsService.findOne.mockResolvedValue(mockComment);
      mockCommentsService.remove.mockResolvedValue({ affected: 1 });

      const result = await controller.remove('comment-uuid', mockRequest as any);

      expect(mockCommentsService.remove).toHaveBeenCalledWith('comment-uuid');
      expect(result).toEqual({ affected: 1 });
    });

    it('should return 403 if user is not owner or admin', async () => {
      mockCommentsService.findOne.mockResolvedValue({
        ...mockComment,
        user: { id: 'other-user', adminSecret: 'other-secret' },
      });
      const result = await controller.remove('comment-uuid', mockRequest as any);
      expect((result as any).statusCode).toBe(403);
    });
  });

  describe('getCommentsByPost', () => {
    it('should return comments for a post', async () => {
      mockCommentsService.findByPost.mockResolvedValue([mockComment]);
      const result = await controller.getCommentsByPost('post-uuid');
      expect(result).toEqual([mockComment]);
      expect(mockCommentsService.findByPost).toHaveBeenCalledWith('post-uuid');
    });
  });
});
