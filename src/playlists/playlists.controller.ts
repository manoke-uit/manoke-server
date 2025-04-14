import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, DefaultValuePipe } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { DeleteResult, UpdateResult } from 'typeorm';
import { Playlist } from './entities/playlist.entity';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  create(@Body() createPlaylistDto: CreatePlaylistDto): Promise<Playlist>  {
    return this.playlistsService.create(createPlaylistDto);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number = 1, 
    @Query('limit', new  DefaultValuePipe(10), ParseIntPipe)
    limit = 10 
  ) : Promise<Pagination<Playlist>> {
  limit = limit > 100 ? 100 : limit;
    return this.playlistsService.paginate( {
        page, limit
      } 
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Playlist | null> {
    return this.playlistsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlaylistDto: UpdatePlaylistDto): Promise<UpdateResult>  {
    return this.playlistsService.update(id, updatePlaylistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<DeleteResult> {
    return this.playlistsService.remove(id);
  }
}

