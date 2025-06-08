import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

const mockPlaylistsService = {
  create: jest.fn(),
  findUserPlaylist: jest.fn(),
  findPublicPlaylist: jest.fn(),
  addSongToPlaylist: jest.fn(),
  addSongToFavouritePlaylist: jest.fn(),
  getFavouriteSongs: jest.fn(),
  getSongsInPlaylist: jest.fn(),
  removeSongFromPlaylist: jest.fn(),
  removeSongFromFavouritePlaylist: jest.fn(),
  findOne: jest.fn(),
  searchPlaylist: jest.fn(),
  clonePlaylist: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByTitle: jest.fn(),
};

describe('PlaylistsController', () => {
  let controller: PlaylistsController;
  let service: typeof mockPlaylistsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistsController],
      providers: [
        { provide: PlaylistsService, useValue: mockPlaylistsService },
      ],
    }).compile();

    controller = module.get<PlaylistsController>(PlaylistsController);
    service = module.get(PlaylistsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with correct params', async () => {
      const dto: CreatePlaylistDto = { title: 'test', songIds: [] } as any;
      const req = { user: { userId: 'user1' } };
      const playlist = { id: '1', title: 'test' };
      service.create.mockResolvedValue(playlist);

      const result = await controller.create(dto, req, undefined);
      expect(service.create).toHaveBeenCalledWith({ ...dto, userId: 'user1' }, undefined, undefined);
      expect(result).toEqual(playlist);
    });
  });

  describe('findUserPlaylist', () => {
    it('should return user playlists', async () => {
      const req = { user: { userId: 'user1' } };
      service.findUserPlaylist.mockResolvedValue([{ id: '1' }]);
      const result = await controller.findUserPlaylist(req);
      expect(service.findUserPlaylist).toHaveBeenCalledWith('user1');
      expect(result).toEqual([{ id: '1' }]);
    });
  });

  describe('findPublicPlaylist', () => {
    it('should return public playlists', async () => {
      service.findPublicPlaylist.mockResolvedValue([{ id: '1' }]);
      const result = await controller.findPublicPlaylist();
      expect(service.findPublicPlaylist).toHaveBeenCalled();
      expect(result).toEqual([{ id: '1' }]);
    });
  });

  // describe('addSongToPlaylist', () => {
  //   it('should add song to playlist', async () => {
  //     service.addSongToPlaylist.mockResolvedValue({ id: '1', songs: [{ id: 'song1' }] });
  //     const result = await controller.addSongToPlaylist('playlist1', 'song1');
  //     expect(service.addSongToPlaylist).toHaveBeenCalledWith('playlist1', 'song1');
  //     expect(result).toHaveProperty('songs');
  //   });
  // });

  describe('addSongToFavouritePlaylist', () => {
    it('should add song to favourite playlist', async () => {
      service.addSongToFavouritePlaylist.mockResolvedValue({ id: 'fav', songs: [{ id: 'song1' }] });
      const result = await controller.addSongToFavouritePlaylist('song1');
      expect(service.addSongToFavouritePlaylist).toHaveBeenCalledWith('Favourite Playlist', 'song1');
      expect(result).toHaveProperty('songs');
    });
  });

  describe('getFavSongs', () => {
    it('should get favourite songs', async () => {
      service.getFavouriteSongs.mockResolvedValue([{ id: 'song1' }]);
      const result = await controller.getFavSongs();
      expect(service.getFavouriteSongs).toHaveBeenCalledWith('Favourite Playlist');
      expect(result).toEqual([{ id: 'song1' }]);
    });
  });

  describe('getSongsInPlaylist', () => {
    it('should get songs in playlist', async () => {
      service.getSongsInPlaylist.mockResolvedValue([{ id: 'song1' }]);
      const result = await controller.getSongsInPlaylist('playlist1');
      expect(service.getSongsInPlaylist).toHaveBeenCalledWith('playlist1');
      expect(result).toEqual([{ id: 'song1' }]);
    });
  });

  describe('removeSongFromPlaylist', () => {
    it('should remove song from playlist if user is owner', async () => {
      const req = { user: { userId: 'user1' } };
      service.findOne.mockResolvedValue({ user: { id: 'user1' } });
      service.removeSongFromPlaylist.mockResolvedValue({ id: 'playlist1', songs: [] });
      const result = await controller.removeSongFromPlaylist('playlist1', 'song1', req);
      expect(service.removeSongFromPlaylist).toHaveBeenCalledWith('playlist1', 'song1');
      expect(result).toHaveProperty('id', 'playlist1');
    });
  });

  describe('removeSongFromFavouritePlaylist', () => {
    it('should remove song from favourite playlist if user is owner', async () => {
      const req = { user: { userId: 'user1' } };
      service.findByTitle.mockResolvedValue({ user: { id: 'user1' } });
      service.removeSongFromFavouritePlaylist.mockResolvedValue({ id: 'fav', songs: [] });
      const result = await controller.removeSongFromFavouritePlaylist('song1', req);
      expect(service.removeSongFromFavouritePlaylist).toHaveBeenCalledWith('Favourite Playlist', 'song1');
      expect(result).toHaveProperty('id', 'fav');
    });
  });

  describe('findOne', () => {
    it('should return a playlist', async () => {
      service.findOne.mockResolvedValue({ id: 'playlist1' });
      const result = await controller.findOne('playlist1');
      expect(service.findOne).toHaveBeenCalledWith('playlist1');
      expect(result).toHaveProperty('id', 'playlist1');
    });
  });

  describe('searchPlaylist', () => {
    it('should return playlists matching search', async () => {
      service.searchPlaylist.mockResolvedValue([{ id: 'playlist1' }]);
      const result = await controller.searchPlaylist('playlist');
      expect(service.searchPlaylist).toHaveBeenCalledWith('playlist');
      expect(result).toEqual([{ id: 'playlist1' }]);
    });

    it('should return message if no playlists found', async () => {
      service.searchPlaylist.mockResolvedValue([]);
      const result = await controller.searchPlaylist('notfound');
      expect(result).toEqual({ message: 'No playlists found matching the search criteria.' });
    });
  });

  describe('clonePlaylist', () => {
    it('should clone a playlist', async () => {
      const req = { user: { userId: 'user1' } };
      service.clonePlaylist.mockResolvedValue({ id: 'cloned' });
      const result = await controller.clonePlaylist(req, 'playlist1');
      expect(service.clonePlaylist).toHaveBeenCalledWith('user1', 'playlist1');
      expect(result).toHaveProperty('id', 'cloned');
    });
  });

  describe('findAll', () => {
    it('should return all playlists', async () => {
      service.findAll.mockResolvedValue([{ id: 'playlist1' }]);
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'playlist1' }]);
    });
  });

  describe('update', () => {
    it('should update playlist if user is owner', async () => {
      const req = { user: { userId: 'user1', adminSecret: undefined } };
      const dto: UpdatePlaylistDto = { title: 'new title' } as any;
      service.findOne.mockResolvedValue({ user: { id: 'user1' } });
      service.update.mockResolvedValue({ id: 'playlist1', title: 'new title' });
      const result = await controller.update('playlist1', dto, req, undefined);
      expect(service.update).toHaveBeenCalled();
      expect(result).toHaveProperty('title', 'new title');
    });
  });

  describe('remove', () => {
    it('should remove playlist if user is owner', async () => {
      const req = { user: { userId: 'user1', adminSecret: undefined } };
      service.findOne.mockResolvedValue({ user: { id: 'user1' } });
      service.remove.mockResolvedValue({ affected: 1 });
      const result = await controller.remove('playlist1', req);
      expect(service.remove).toHaveBeenCalledWith('playlist1');
      expect(result).toHaveProperty('affected', 1);
    });
  });
});