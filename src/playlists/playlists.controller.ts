import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, DefaultValuePipe, UseGuards, Req } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { DeleteResult, UpdateResult } from 'typeorm';
import { Playlist } from './entities/playlist.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin-guard';
import { responseHelper } from 'src/helpers/response.helper';

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

  @UseGuards(JwtAuthGuard)
  @Post('clonePlaylist') 
  async clonePlaylist(
    @Req() req: any, 
    @Query('q') playlistId: string
  ) {
    return await this.playlistsService.clonePlaylist(req.user['userId'], playlistId)
  }

  @UseGuards(JwtAdminGuard)
  @Get()
  async findAll(
  ): Promise<Playlist[]> {
    return await this.playlistsService.findAll();
  }

  // if the playlist is private and the user is not the owner, can't see the playlist right?
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Playlist | null> {
    return await this.playlistsService.findOne(id);
  }

  // get all the PUBLIC playlists
  @Get('publicPlaylist')
  @UseGuards(JwtAuthGuard)
  async findPublicPlaylist(): Promise<Playlist[]> {
    return await this.playlistsService.findPublicPlaylist();
  }

  @Get('userPlaylist')
  @UseGuards(JwtAuthGuard)
  async findUserPlaylist(
    @Req() req: any
  ): Promise<Playlist[]> {
    return await this.playlistsService.findUserPlaylist(req.user['userId']);
  }


  // TODO: check if the user is the owner of the playlist before getting the playlist
  // also where is the fetch playlist function...

  // only the owner of the playlist can update it
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePlaylistDto: UpdatePlaylistDto, @Req() req: any){
    const playlist = await this.playlistsService.findOne(id);
    if(playlist?.user.id !== req.user['userId'] || playlist?.user.adminSecret !== req.user['adminSecret']) {
      return responseHelper({
        message: 'You are not authorized to update this playlist',
        statusCode: 403,
      });
    }
    return await this.playlistsService.update(id, updatePlaylistDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req:any) {
    const playlist = await this.playlistsService.findOne(id);
    if(playlist?.user.id !== req.user['userId'] || playlist?.user.adminSecret !== req.user['adminSecret']) {
      return responseHelper({
        message: 'You are not authorized to delete this playlist',
        statusCode: 403,
      });
    }
    return await this.playlistsService.remove(id);
  }
}

