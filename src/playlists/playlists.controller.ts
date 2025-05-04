import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, DefaultValuePipe, UseGuards } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { DeleteResult, UpdateResult } from 'typeorm';
import { Playlist } from './entities/playlist.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPlaylistDto: CreatePlaylistDto): Promise<Playlist> {
    return this.playlistsService.create(createPlaylistDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':playlistID/songs/:songId')
  addSongToPlaylist(
    @Param('playlistId') playlistId: string,
    @Param('songId') songId: string
  ): Promise<Playlist> {
    return this.playlistsService.addSongToPlaylist(playlistId, songId)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('favPlaylist/songs/:songId')
  addSongToFavouritePlaylist(
    @Param('songId') songId: string
  ): Promise<Playlist> {
    return this.playlistsService.addSongToFavouritePlaylist("Favourite Playlist", songId)
  }

  @UseGuards(JwtAuthGuard)
  @Get('favPlaylist/songs')
  getFavSongs() {
    return this.playlistsService.getFavouriteSongs("Favourite Playlist");
  }

  @UseGuards(JwtAuthGuard)
  @Get(':playlistId/songs')
  getSongsInPlaylist(
    @Param('playlistId') playlistId: string
  ) {
    return this.playlistsService.getSongsInPlaylist(playlistId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':playlistID/songs/:songId')
  removeSongFromPlaylist(
    @Param('playlistId') playlistId: string,
    @Param('songId') songId: string
  ): Promise<Playlist> {
    return this.playlistsService.removeSongFromPlaylist(playlistId, songId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('favPlaylist/songs/:songId')
  removeSongFromFavouritePlaylist(
    @Param('songId') songId: string
  ): Promise<Playlist> {
    return this.playlistsService.removeSongFromFavouritePlaylist("Favourite Playlist", songId);
  }


  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit = 10
  ): Promise<Pagination<Playlist>> {
    limit = limit > 100 ? 100 : limit;
    return this.playlistsService.paginate({
      page, limit
    }
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Playlist | null> {
    return this.playlistsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlaylistDto: UpdatePlaylistDto): Promise<UpdateResult> {
    return this.playlistsService.update(id, updatePlaylistDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<DeleteResult> {
    return this.playlistsService.remove(id);
  }
}

