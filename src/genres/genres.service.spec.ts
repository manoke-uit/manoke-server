import { Test, TestingModule } from '@nestjs/testing';
import { GenresService } from './genres.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { Song } from 'src/songs/entities/song.entity';
import { Repository, DeleteResult } from 'typeorm';

const mockGenreRepository = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(),
});
const mockSongRepository = () => ({
  findBy: jest.fn(),
});

describe('GenresService', () => {
  let service: GenresService;
  let genreRepository: jest.Mocked<Repository<Genre>>;
  let songRepository: jest.Mocked<Repository<Song>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        { provide: getRepositoryToken(Genre), useFactory: mockGenreRepository },
        { provide: getRepositoryToken(Song), useFactory: mockSongRepository },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
    genreRepository = module.get(getRepositoryToken(Genre));
    songRepository = module.get(getRepositoryToken(Song));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a genre with songs', async () => {
      const dto = { name: 'Pop', songIds: ['1', '2'] };
      const songs = [{ id: '1' }, { id: '2' }] as Song[];
      const savedGenre = { id: 'g1', name: 'Pop', songs } as Genre;
      songRepository.findBy.mockResolvedValue(songs);
      genreRepository.save.mockResolvedValue(savedGenre);
      genreRepository.findOne.mockResolvedValue(savedGenre);

      const result = await service.create(dto);

      expect(songRepository.findBy).toHaveBeenCalledWith({ id: expect.any(Object) });
      expect(genreRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Pop', songs }));
      expect(result).toEqual(savedGenre);
    });

    it('should create a genre without songs', async () => {
      const dto = { name: 'Rock' };
      const savedGenre = { id: 'g2', name: 'Rock', songs: [] } as Genre;
      genreRepository.save.mockResolvedValue(savedGenre);
      genreRepository.findOne.mockResolvedValue(savedGenre);

      const result = await service.create(dto);

      expect(genreRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Rock', songs: [] }));
      expect(result).toEqual(savedGenre);
    });
  });

  describe('findAll', () => {
    it('should return all genres', async () => {
      const genres = [{ id: 'g1', name: 'Pop', songs: [] }] as Genre[];
      genreRepository.find.mockResolvedValue(genres);

      const result = await service.findAll();

      expect(genreRepository.find).toHaveBeenCalledWith({
        relations: ['songs'],
        order: { name: 'ASC' },
      });
      expect(result).toEqual(genres);
    });
  });

  describe('findOne', () => {
    it('should return a genre by id', async () => {
      const genre = { id: 'g1', name: 'Pop', songs: [] } as Genre;
      genreRepository.findOne.mockResolvedValue(genre);

      const result = await service.findOne('g1');

      expect(genreRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'g1' },
        relations: ['songs'],
      });
      expect(result).toEqual(genre);
    });
  });

  describe('update', () => {
    it('should update a genre', async () => {
      const genre = { id: 'g1', name: 'Pop', songs: [] } as Genre;
      const dto = { name: 'Jazz', songIds: ['1'] };
      const songs = [{ id: '1' }] as Song[];
      genreRepository.findOneBy.mockResolvedValue(genre);
      songRepository.findBy.mockResolvedValue(songs);
      genreRepository.save.mockResolvedValue({ ...genre, name: 'Jazz', songs });
      genreRepository.findOne.mockResolvedValue({ ...genre, name: 'Jazz', songs });

      const result = await service.update('g1', dto);

      expect(genreRepository.findOneBy).toHaveBeenCalledWith({ id: 'g1' });
      expect(songRepository.findBy).toHaveBeenCalledWith({ id: expect.any(Object) });
      expect(genreRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jazz', songs }));
      expect(result).toEqual({ ...genre, name: 'Jazz', songs });
    });

    it('should throw if genre not found', async () => {
      genreRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update('g1', { name: 'Jazz' })).rejects.toThrow('Genre not found');
    });
  });

  describe('remove', () => {
    it('should remove a genre', async () => {
      const deleteResult = { affected: 1 } as DeleteResult;
      genreRepository.delete.mockResolvedValue(deleteResult);

      const result = await service.remove('g1');

      expect(genreRepository.delete).toHaveBeenCalledWith('g1');
      expect(result).toEqual(deleteResult);
    });
  });
});
