import { Test, TestingModule } from '@nestjs/testing';
import { ArtistsService } from './artists.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Artist } from './entities/artist.entity';
import { Song } from 'src/songs/entities/song.entity';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { Repository, DeleteResult } from 'typeorm';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

const mockArtistRepository = () => ({
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findBy: jest.fn(),
  delete: jest.fn(),
});
const mockSongRepository = () => ({
  findBy: jest.fn(),
});
const mockSupabaseStorageService = () => ({
  uploadArtistsImagesFromBuffer: jest.fn(),
});

describe('ArtistsService', () => {
  let service: ArtistsService;
  let artistRepository: jest.Mocked<Repository<Artist>>;
  let songRepository: jest.Mocked<Repository<Song>>;
  let supabaseStorageService: jest.Mocked<SupabaseStorageService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtistsService,
        { provide: getRepositoryToken(Artist), useFactory: mockArtistRepository },
        { provide: getRepositoryToken(Song), useFactory: mockSongRepository },
        { provide: SupabaseStorageService, useFactory: mockSupabaseStorageService },
      ],
    }).compile();

    service = module.get<ArtistsService>(ArtistsService);
    artistRepository = module.get(getRepositoryToken(Artist));
    songRepository = module.get(getRepositoryToken(Song));
    supabaseStorageService = module.get(SupabaseStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an artist without image', async () => {
      const dto: CreateArtistDto = { name: 'Artist 1', songIds: [] };
      const savedArtist = { id: '1', name: 'Artist 1', songs: [] } as Artist;
      artistRepository.save.mockResolvedValue(savedArtist);
      artistRepository.findOne.mockResolvedValue(savedArtist);

      const result = await service.create(dto);

      expect(artistRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedArtist);
    });

    it('should create an artist with image', async () => {
      const dto: CreateArtistDto = { name: 'Artist 2', songIds: [] };
      const buffer = Buffer.from('image');
      const imageName = 'artist.png';
      const imageUrl = 'http://image.url/artist.png';
      supabaseStorageService.uploadArtistsImagesFromBuffer.mockResolvedValue(imageUrl);
      const savedArtist = { id: '2', name: 'Artist 2', imageUrl, songs: [] } as Artist;
      artistRepository.save.mockResolvedValue(savedArtist);
      artistRepository.findOne.mockResolvedValue(savedArtist);

      const result = await service.create(dto, buffer, imageName);

      expect(supabaseStorageService.uploadArtistsImagesFromBuffer).toHaveBeenCalled();
      expect(artistRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedArtist);
    });

    it('should throw error if image upload fails', async () => {
      const dto: CreateArtistDto = { name: 'Artist 3', songIds: [] };
      supabaseStorageService.uploadArtistsImagesFromBuffer.mockResolvedValue(null);

      await expect(service.create(dto, Buffer.from('img'), 'fail.png')).rejects.toThrow('Image upload failed');
    });
  });

  describe('findAll', () => {
    it('should return all artists', async () => {
      const artists = [{ id: '1', name: 'A', songs: [] }] as Artist[];
      artistRepository.find.mockResolvedValue(artists);

      const result = await service.findAll();

      expect(artistRepository.find).toHaveBeenCalledWith({
        relations: ['songs'],
        order: { name: 'ASC' },
      });
      expect(result).toEqual(artists);
    });
  });

  describe('findOne', () => {
    it('should return an artist by id', async () => {
      const artist = { id: '1', name: 'A', songs: [] } as Artist;
      artistRepository.findOne.mockResolvedValue(artist);

      const result = await service.findOne('1');

      expect(artistRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' }, relations: ['songs'] });
      expect(result).toEqual(artist);
    });
  });

  describe('update', () => {
    it('should update an artist', async () => {
      const artist = { id: '1', name: 'Old', songs: [] } as Artist;
      const dto: UpdateArtistDto = { name: 'New', songIds: [] };
      artistRepository.findOne.mockResolvedValue(artist);
      artistRepository.save.mockResolvedValue({ ...artist, name: 'New' });
      artistRepository.findOne.mockResolvedValue({ ...artist, name: 'New' });

      const result = await service.update('1', dto);

      expect(artistRepository.save).toHaveBeenCalled();
      expect(result?.name).toBe('New');
    });

    it('should throw error if artist not found', async () => {
      artistRepository.findOne.mockResolvedValue(null);
      const dto: UpdateArtistDto = { name: 'New', songIds: [] };

      await expect(service.update('1', dto)).rejects.toThrow('Artist not found');
    });

    it('should update artist image', async () => {
      const artist = { id: '1', name: 'Old', songs: [] } as Artist;
      const dto: UpdateArtistDto = { name: 'Old', songIds: [] };
      const buffer = Buffer.from('img');
      const imageUrl = 'http://img.url/artist.png';
      artistRepository.findOne.mockResolvedValue(artist);
      supabaseStorageService.uploadArtistsImagesFromBuffer.mockResolvedValue(imageUrl);
      artistRepository.save.mockResolvedValue({ ...artist, imageUrl });
      artistRepository.findOne.mockResolvedValue({ ...artist, imageUrl });

      const result = await service.update('1', dto, buffer, 'artist.png');

      expect(supabaseStorageService.uploadArtistsImagesFromBuffer).toHaveBeenCalled();
      expect(result?.imageUrl).toBe(imageUrl);
    });
  });

  describe('remove', () => {
    it('should delete an artist', async () => {
      const deleteResult = { affected: 1 } as DeleteResult;
      artistRepository.delete.mockResolvedValue(deleteResult);

      const result = await service.remove('1');

      expect(artistRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(deleteResult);
    });
  });
});
