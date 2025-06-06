import { Test, TestingModule } from '@nestjs/testing';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { responseHelper } from 'src/helpers/response.helper';

describe('ArtistsController', () => {
  let controller: ArtistsController;
  let service: ArtistsService;

  const mockArtist = {
    id: 'uuid-artist-1',
    name: 'Artist 1',
    imageUrl: 'http://image.url/artist1.jpg',
    songs: [],
  };

  const mockPagination = {
    items: [mockArtist],
    meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
    links: {},
  };

  const mockArtistsService = {
    create: jest.fn(),
    paginate: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistsController],
      providers: [
        { provide: ArtistsService, useValue: mockArtistsService },
      ],
    }).compile();

    controller = module.get<ArtistsController>(ArtistsController);
    service = module.get<ArtistsService>(ArtistsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return success response when artist is created', async () => {
      const dto: CreateArtistDto = { name: 'Artist 1', imageUrl: undefined, songIds: [] };
      mockArtistsService.create.mockResolvedValue(mockArtist);

      const result = await controller.create(dto, undefined);

      expect(result).toEqual(responseHelper({
        message: 'Artist created successfully',
        data: mockArtist,
        statusCode: 201,
      }));
      expect(mockArtistsService.create).toHaveBeenCalledWith(dto, undefined, undefined);
    });

    it('should return failed response when artist creation fails', async () => {
      const dto: CreateArtistDto = { name: 'Artist 1', imageUrl: undefined, songIds: [] };
      mockArtistsService.create.mockResolvedValue(null);

      const result = await controller.create(dto, undefined);

      expect(result).toEqual(responseHelper({
        message: 'Artist creation failed',
        statusCode: 400,
      }));
    });
  });

  describe('findAll', () => {
    it('should return paginated artists', async () => {
      mockArtistsService.paginate.mockResolvedValue(mockPagination);

      const result = await controller.findAll(1, 10);

      expect(result).toBe(mockPagination);
      expect(mockArtistsService.paginate).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should cap limit at 100', async () => {
      mockArtistsService.paginate.mockResolvedValue(mockPagination);

      await controller.findAll(1, 200);

      expect(mockArtistsService.paginate).toHaveBeenCalledWith({ page: 1, limit: 100 });
    });
  });

  describe('findOne', () => {
    it('should return artist if found', async () => {
      mockArtistsService.findOne.mockResolvedValue(mockArtist);

      const result = await controller.findOne('uuid-artist-1');

      expect(result).toEqual(responseHelper({
        message: 'Artist found successfully',
        data: mockArtist,
        statusCode: 200,
      }));
      expect(mockArtistsService.findOne).toHaveBeenCalledWith('uuid-artist-1');
    });

    it('should return 404 if artist not found', async () => {
      mockArtistsService.findOne.mockResolvedValue(null);

      const result = await controller.findOne('uuid-artist-2');

      expect(result).toEqual(responseHelper({
        message: 'Artist not found',
        statusCode: 404,
      }));
    });
  });

  describe('update', () => {
    it('should return success response when artist is updated', async () => {
      const dto: UpdateArtistDto = { name: 'Updated Artist', songIds: [] };
      mockArtistsService.update.mockResolvedValue(mockArtist);

      const result = await controller.update('uuid-artist-1', dto, undefined);

      expect(result).toEqual(responseHelper({
        message: 'Artist updated successfully',
        data: mockArtist,
        statusCode: 200,
      }));
      expect(mockArtistsService.update).toHaveBeenCalledWith('uuid-artist-1', dto, undefined, undefined);
    });

    it('should return failed response when artist update fails', async () => {
      const dto: UpdateArtistDto = { name: 'Updated Artist', songIds: [] };
      mockArtistsService.update.mockResolvedValue(null);

      const result = await controller.update('uuid-artist-1', dto, undefined);

      expect(result).toEqual(responseHelper({
        message: 'Artist update failed',
        statusCode: 400,
      }));
    });
  });

  describe('remove', () => {
    it('should return success response when artist is deleted', async () => {
      const deleteResult = { affected: 1 };
      mockArtistsService.remove.mockResolvedValue(deleteResult);

      const result = await controller.remove('uuid-artist-1');

      expect(result).toEqual(responseHelper({
        message: 'Artist deleted successfully',
        data: deleteResult,
        statusCode: 200,
      }));
      expect(mockArtistsService.remove).toHaveBeenCalledWith('uuid-artist-1');
    });

    it('should return failed response when artist deletion fails', async () => {
      mockArtistsService.remove.mockResolvedValue(null);

      const result = await controller.remove('uuid-artist-1');

      expect(result).toEqual(responseHelper({
        message: 'Artist deletion failed',
        statusCode: 400,
      }));
    });
  });
});
