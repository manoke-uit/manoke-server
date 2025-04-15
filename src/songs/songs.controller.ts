import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin-guard';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Song } from './entities/song.entity';
import { DeleteResult, UpdateResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @UseGuards(JwtAdminGuard)
  @Post()
  create(@Body() createSongDto: CreateSongDto) {
    return this.songsService.create(createSongDto);
  }

  @Get()
  findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe)
      page: number = 1, 
      @Query('limit', new  DefaultValuePipe(10), ParseIntPipe)
      limit = 10 
    ) : Promise<Pagination<Song>> {
      limit = limit > 100 ? 100 : limit;
      return this.songsService.paginate( {
          page, limit
        } 
      );
    }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Song | null> {
    return this.songsService.findOne(id);
  }

  @UseGuards(JwtAdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSongDto: UpdateSongDto): Promise<UpdateResult> {
    return this.songsService.update(id, updateSongDto);
  }

  @UseGuards(JwtAdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<DeleteResult> {
    return this.songsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('search')
  searchSongs(@Body('query') query: string): Promise<Song[]> {
    return this.songsService.search(query);
  }
}
