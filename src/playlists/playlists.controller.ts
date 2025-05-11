import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, DefaultValuePipe, UseGuards, Req } from '@nestjs/common';
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
  async create(@Body() createPlaylistDto: CreatePlaylistDto, @Req() req:any): Promise<Playlist> {
    createPlaylistDto.userId = req.user['userId']; // set the userId from the request
    return this.playlistsService.create(createPlaylistDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':playlistID/songs/:songId')
  async addSongToPlaylist(
    @Param('playlistId') playlistId: string,
    @Param('songId') songId: string
  ): Promise<Playlist> {
    return await this.playlistsService.addSongToPlaylist(playlistId, songId)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('favPlaylist/songs/:songId')
  async addSongToFavouritePlaylist(
    @Param('songId') songId: string
  ): Promise<Playlist> {
    return await this.playlistsService.addSongToFavouritePlaylist("Favourite Playlist", songId)
  }

  @UseGuards(JwtAuthGuard)
  @Get('favPlaylist/songs')
  async getFavSongs() {
    return await this.playlistsService.getFavouriteSongs("Favourite Playlist");
  }

  @UseGuards(JwtAuthGuard)
  @Get(':playlistId/songs')
  async getSongsInPlaylist(
    @Param('playlistId') playlistId: string
  ) {
    return await this.playlistsService.getSongsInPlaylist(playlistId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':playlistId/songs/:songId')
  async removeSongFromPlaylist(
    @Param('playlistId') playlistId: string,
    @Param('songId') songId: string,
    @Req() req: any
  ): Promise<Playlist> {
    const playlist = await this.playlistsService.findOne(playlistId);
    if(playlist?.user.id !== req.user['userId']) {
      throw new Error("You are not authorized to remove this song from the playlist");
    }
    return await this.playlistsService.removeSongFromPlaylist(playlistId, songId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('favPlaylist/songs/:songId')
  async removeSongFromFavouritePlaylist(
    @Param('songId') songId: string,
    @Req() req: any
  ): Promise<Playlist> {
    const playlist = await this.playlistsService.findByTitle("Favourite Playlist");
    if(playlist?.user.id !== req.user['userId']) {
      throw new Error("You are not authorized to remove this song from the favourite playlist");
    }
    return await this.playlistsService.removeSongFromFavouritePlaylist("Favourite Playlist", songId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':searchTitle')
  async searchPlaylist(@Param('searchTitle') searchTitle: string) {
    const playlists = await this.playlistsService.searchPlaylist(searchTitle);
    if (playlists.length === 0) {
      return { message: 'No playlists found matching the search criteria.' };
    }
    return playlists;
  }



  // get all the PUBLIC playlists
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit = 10
  ): Promise<Pagination<Playlist>> {
    limit = limit > 100 ? 100 : limit;
    return await this.playlistsService.paginate({
      page, limit
    }
    );
  }

  // if the playlist is private and the user is not the owner, can't see the playlist right?
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Playlist | null> {
    return await this.playlistsService.findOne(id);
  }

  // TODO: check if the user is the owner of the playlist before getting the playlist
  // also where is the fetch playlist function...

  // only the owner of the playlist can update it
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePlaylistDto: UpdatePlaylistDto, @Req() req : any): Promise<UpdateResult> {
    if(req.user['userId'] !== id) {
      throw new Error("You are not authorized to update this playlist");
    }
    return await this.playlistsService.update(id, updatePlaylistDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req : any): Promise<DeleteResult> {
    if(req.user['userId'] !== id) {
      throw new Error("You are not authorized to delete this playlist");
    }
    return await this.playlistsService.remove(id);
  }
}

