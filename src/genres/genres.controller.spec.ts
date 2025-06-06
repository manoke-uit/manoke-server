import { Test, TestingModule } from '@nestjs/testing';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

const mockGenresService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('GenresController', () => {
  let controller: GenresController;
  let service: typeof mockGenresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenresController],
      providers: [
        { provide: GenresService, useValue: mockGenresService },
      ],
    }).compile();

    controller = module.get<GenresController>(GenresController);
    service = module.get(GenresService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return success response when genre is created', async () => {
      const dto: CreateGenreDto = { name: 'Pop', songIds: ['1', '2'] };
      const genre = { id: 'g1', name: 'Pop', songs: [] };
      service.create.mockResolvedValue(genre);

      const res = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(res.statusCode).toBe(201);
      expect(res.data).toEqual(genre);
    });

    it('should return failed response when genre creation fails', async () => {
      service.create.mockResolvedValue(null);

      const res = await controller.create({ name: 'Pop' });

      expect(res.statusCode).toBe(400);
      expect(res.message).toBe('Genre creation failed');
    });
  });

  describe('findAll', () => {
    it('should return all genres', async () => {
      const genres = [{ id: 'g1', name: 'Pop', songs: [] }];
      service.findAll.mockResolvedValue(genres);

      const res = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual(genres);
    });

    it('should return not found if no genres', async () => {
      service.findAll.mockResolvedValue(null);

      const res = await controller.findAll();

      expect(res.statusCode).toBe(404);
      expect(res.message).toBe('No genres found');
    });
  });

  describe('findOne', () => {
    it('should return a genre by id', async () => {
      const genre = { id: 'g1', name: 'Pop', songs: [] };
      service.findOne.mockResolvedValue(genre);

      const res = await controller.findOne('g1');

      expect(service.findOne).toHaveBeenCalledWith('g1');
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual(genre);
    });

    it('should return not found if genre does not exist', async () => {
      service.findOne.mockResolvedValue(null);

      const res = await controller.findOne('g1');

      expect(res.statusCode).toBe(404);
      expect(res.message).toBe('Genre not found');
    });
  });

  describe('update', () => {
    it('should return updated genre', async () => {
      const dto: UpdateGenreDto = { name: 'Rock', songIds: ['1'] };
      const updatedGenre = { id: 'g1', name: 'Rock', songs: [] };
      service.update.mockResolvedValue(updatedGenre);

      const res = await controller.update('g1', dto);

      expect(service.update).toHaveBeenCalledWith('g1', dto);
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual(updatedGenre);
    });

    it('should return failed response if update fails', async () => {
      service.update.mockResolvedValue(null);

      const res = await controller.update('g1', { name: 'Rock' });

      expect(res.statusCode).toBe(400);
      expect(res.message).toBe('Genre update failed');
    });
  });

  describe('remove', () => {
    it('should return deleted genre result', async () => {
      const deleteResult = { affected: 1 };
      service.remove.mockResolvedValue(deleteResult);

      const res = await controller.remove('g1');

      expect(service.remove).toHaveBeenCalledWith('g1');
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual(deleteResult);
    });

    it('should return failed response if deletion fails', async () => {
      service.remove.mockResolvedValue(null);

      const res = await controller.remove('g1');

      expect(res.statusCode).toBe(400);
      expect(res.message).toBe('Genre deletion failed');
    });
  });
});