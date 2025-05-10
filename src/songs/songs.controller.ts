import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, DefaultValuePipe, ParseIntPipe, UseInterceptors, UploadedFile } from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin-guard';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Song } from './entities/song.entity';
import { DeleteResult, UpdateResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ScoresService } from 'src/scores/scores.service';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @UseGuards(JwtAdminGuard)
  @Post()
  create(@Body() createSongDto: CreateSongDto) {
    return this.songsService.create(createSongDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  searchSongs(@Query('q') query: string): Promise<Song[]> {
    return this.songsService.search(query);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('search/youtube')
  // searchSongsWithYoutube(@Query('y') youtubeUrl: string): Promise<Song[]> {
  //   return this.songsService.searchWithYoutube(youtubeUrl);
  // }

  @Get('find-one')
  findOnePrecisely(@Query('title') title: string, @Query('artistName') artistName : string): Promise<Song | null> {
    return this.songsService.findOnePrecisely(title, artistName);
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




}
