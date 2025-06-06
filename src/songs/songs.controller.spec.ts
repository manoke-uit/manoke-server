import { Test, TestingModule } from '@nestjs/testing';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { responseHelper } from 'src/helpers/response.helper';

describe('SongsController', () => {
  let controller: SongsController;
  let songsService: jest.Mocked<SongsService>;

  const mockSong = {
    id: '1',
    title: 'Song 1',
    lyrics: 'lyrics',
    songUrl: 'http://audio.url',
    imageUrl: 'http://image.url',
    artists: [],
    playlists: [],
    genres: [],
    scores: [],
    karaoke: null,    // hoặc {} nếu entity của bạn là object
    karaokes: [],     // <-- Thêm dòng này nếu entity Song có trường karaokes
  };

  const mockSongsService = {
    create: jest.fn(),
    addArtistToSong: jest.fn(),
    addGenreToSong: jest.fn(),
    removeArtistFromSong: jest.fn(),
    removeGenreFromSong: jest.fn(),
    search: jest.fn(),
    searchByArtist: jest.fn(),
    findAll: jest.fn(),
    findAllByGenre: jest.fn(),
    findAllByArtist: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as unknown as jest.Mocked<SongsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SongsController],
      providers: [{ provide: SongsService, useValue: mockSongsService }],
    }).compile();

    controller = module.get<SongsController>(SongsController);
    songsService = module.get(SongsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return 400 if no audio file', async () => {
      const result = await controller.create({ audio: [] }, { title: 'Song 1' } as any);
      expect(result).toEqual(responseHelper({ message: 'Audio file is required', statusCode: 400 }));
    });
    it('should return 400 if song creation failed', async () => {
      songsService.create.mockResolvedValue(null);
      const files = { audio: [{ originalname: 'a.mp3', buffer: Buffer.from('a') }] };
      const result = await controller.create(files as any, { title: 'Song 1' } as any);
      expect(result).toEqual(responseHelper({ message: 'Song creation failed', statusCode: 400 }));
    });

    it('should return 201 if song created', async () => {
      songsService.create.mockResolvedValue(mockSong);
      const files = { audio: [{ originalname: 'a.mp3', buffer: Buffer.from('a') }] };
      const result = await controller.create(files as any, { title: 'Song 1' } as any);
      expect(result).toEqual(responseHelper({ message: 'Song created successfully', data: mockSong, statusCode: 201 }));
    });
  });

  describe('addArtistToSong', () => {
    it('should return 400 if failed', async () => {
      songsService.addArtistToSong.mockResolvedValue(null);
      const result = await controller.addArtistToSong('1', '2');
      expect(result).toEqual(responseHelper({ message: 'Artist connection failed', statusCode: 400 }));
    });
    it('should return 200 if success', async () => {
      songsService.addArtistToSong.mockResolvedValue(mockSong);
      const result = await controller.addArtistToSong('1', '2');
      expect(result).toEqual(responseHelper({ message: 'Artist connection added successfully', data: mockSong, statusCode: 200 }));
    });
  });

  describe('addGenreToSong', () => {
    it('should return 400 if failed', async () => {
      songsService.addGenreToSong.mockResolvedValue(null);
      const result = await controller.addGenreToSong('1', '2');
      expect(result).toEqual(responseHelper({ message: 'Genre connection failed', statusCode: 400 }));
    });
    it('should return 200 if success', async () => {
      songsService.addGenreToSong.mockResolvedValue(mockSong);
      const result = await controller.addGenreToSong('1', '2');
      expect(result).toEqual(responseHelper({ message: 'Genre connection added successfully', data: mockSong, statusCode: 200 }));
    });
  });

  describe('deleteArtistFromSong', () => {
    it('should return 400 if failed', async () => {
      songsService.removeArtistFromSong.mockResolvedValue(null);
      const result = await controller.deleteArtistFromSong('1', '2');
      expect(result).toEqual(responseHelper({ message: 'Artist deletion failed', statusCode: 400 }));
    });
    it('should return 200 if success', async () => {
      songsService.removeArtistFromSong.mockResolvedValue(mockSong);
      const result = await controller.deleteArtistFromSong('1', '2');
      expect(result).toEqual(responseHelper({ message: 'Artist deeltion successfully', data: mockSong, statusCode: 200 }));
    });
  });

  describe('deleteGenreFromSong', () => {
    it('should return 400 if failed', async () => {
      songsService.removeGenreFromSong.mockResolvedValue(null);
      const result = await controller.deleteGenreFromSong('1', '2');
      expect(result).toEqual(responseHelper({ message: 'Genre deletion failed', statusCode: 400 }));
    });
    it('should return 200 if success', async () => {
      songsService.removeGenreFromSong.mockResolvedValue(mockSong);
      const result = await controller.deleteGenreFromSong('1', '2');
      expect(result).toEqual(responseHelper({ message: 'Genre deletion successfully', data: mockSong, statusCode: 200 }));
    });
  });

  describe('searchSongs', () => {
    it('should return all songs if no query', async () => {
      songsService.findAll.mockResolvedValue([mockSong]);
      const result = await controller.searchSongs('');
      expect(result).toEqual([mockSong]);
    });
    it('should return 400 if query too short', async () => {
      const result = await controller.searchSongs('ab');
      expect(result).toEqual(responseHelper({ message: 'Query must be at least 3 characters long', statusCode: 400 }));
    });
    it('should return 400 if query too long', async () => {
      const result = await controller.searchSongs('a'.repeat(21));
      expect(result).toEqual(responseHelper({ message: 'Query must be less than 20 characters long', statusCode: 400 }));
    });
    it('should return 404 if no songs found', async () => {
      songsService.search.mockResolvedValue([]);
      const result = await controller.searchSongs('test');
      expect(result).toEqual(responseHelper({ message: 'No songs found', statusCode: 404 }));
    });
    it('should return 200 if songs found', async () => {
      songsService.search.mockResolvedValue([mockSong]);
      const result = await controller.searchSongs('test');
      expect(result).toEqual(responseHelper({ message: 'Songs retrieved successfully', data: [mockSong], statusCode: 200 }));
    });
    it('should return 404 if service returns null', async () => {
      songsService.search.mockResolvedValue(null as any);
      const result = await controller.searchSongs('test');
      expect(result).toEqual(responseHelper({ message: 'No songs found', statusCode: 404 }));
    });
  });

  describe('searchSongsByArtist', () => {
    it('should return all songs if no artist', async () => {
      songsService.findAll.mockResolvedValue([mockSong]);
      const result = await controller.searchSongsByArtist('');
      expect(result).toEqual([mockSong]);
    });
    it('should return 400 if artist too long', async () => {
      const result = await controller.searchSongsByArtist('a'.repeat(21));
      expect(result).toEqual(responseHelper({ message: 'Query must be less than 20 characters long', statusCode: 400 }));
    });
    it('should return 404 if no songs found', async () => {
      songsService.searchByArtist.mockResolvedValue(null);
      const result = await controller.searchSongsByArtist('test');
      expect(result).toEqual(responseHelper({ message: 'No songs found', statusCode: 404 }));
    });
    it('should return 200 if songs found', async () => {
      songsService.searchByArtist.mockResolvedValue([mockSong]);
      const result = await controller.searchSongsByArtist('test');
      expect(result).toEqual(responseHelper({ message: 'Songs retrieved successfully', data: [mockSong], statusCode: 200 }));
    });
  });

  describe('findAll', () => {
    it('should return all songs', async () => {
      songsService.findAll.mockResolvedValue([mockSong]);
      const result = await controller.findAll();
      expect(result).toEqual(responseHelper({ message: 'Songs retrieved successfully', data: [mockSong], statusCode: 200 }));
    });
    it('should return 200 with empty array if no songs', async () => {
      songsService.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual(responseHelper({ message: 'Songs retrieved successfully', data: [], statusCode: 200 }));
    });
    it('should return 200 with empty array if songs by genre is empty', async () => {
      songsService.findAllByGenre.mockResolvedValue([]);
      const result = await controller.findAll('genreId', undefined);
      expect(result).toEqual(responseHelper({ message: 'Songs retrieved successfully', data: [], statusCode: 200 }));
    });
    it('should return 200 with empty array if songs by artist is empty', async () => {
      songsService.findAllByArtist.mockResolvedValue([]);
      const result = await controller.findAll(undefined, 'artistId');
      expect(result).toEqual(responseHelper({ message: 'Songs retrieved successfully', data: [], statusCode: 200 }));
    });
    it('should return songs by artist', async () => {
      songsService.findAllByArtist.mockResolvedValue([mockSong]);
      const result = await controller.findAll(undefined, 'artistId');
      expect(result).toEqual(responseHelper({ message: 'Songs retrieved successfully', data: [mockSong], statusCode: 200 }));
    });
  });

  describe('findOne', () => {
    it('should return 404 if not found', async () => {
      songsService.findOne.mockResolvedValue(null);
      const result = await controller.findOne('1');
      expect(result).toEqual(responseHelper({ message: 'Song not found', statusCode: 404 }));
    });
    it('should return 200 if found', async () => {
      songsService.findOne.mockResolvedValue(mockSong);
      const result = await controller.findOne('1');
      expect(result).toEqual(responseHelper({ message: 'Song retrieved successfully', data: mockSong, statusCode: 200 }));
    });
  });

  describe('update', () => {
    it('should return 400 if update failed', async () => {
      songsService.update.mockResolvedValue(null);
      const result = await controller.update('1', {}, {} as any);
      expect(result).toEqual(responseHelper({ message: 'Song update failed', statusCode: 400 }));
    });
    it('should return 200 if update success', async () => {
      songsService.update.mockResolvedValue(mockSong);
      const result = await controller.update('1', {}, {} as any);
      expect(result).toEqual(responseHelper({ message: 'Song updated successfully', data: mockSong, statusCode: 200 }));
    });
  });

  describe('remove', () => {
    it('should return 200 if remove failed (affected 0)', async () => {
      songsService.remove.mockResolvedValue({ affected: 0, raw: [] });
      const result = await controller.remove('1');
      expect(result).toEqual(responseHelper({ message: 'Song deleted successfully', data: { affected: 0, raw: [] }, statusCode: 200 }));
    });
    it('should return 200 if remove success', async () => {
      songsService.remove.mockResolvedValue({ affected: 1, raw: [] });
      const result = await controller.remove('1');
      expect(result).toEqual(responseHelper({ message: 'Song deleted successfully', data: { affected: 1, raw: [] }, statusCode: 200 }));
    });
  });
});