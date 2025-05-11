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
import { response } from 'express';
import { responseHelper } from 'src/helpers/response.helper';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(@UploadedFile() file: Express.Multer.File,@Body() createSongDto: CreateSongDto) {
    const fileName = file.originalname; // get the original file name
    const fileBuffer = file.buffer; // get the file buffer
    const createdSong = this.songsService.create(fileBuffer, fileName,createSongDto);
    if(!createdSong) {
      return responseHelper({
        message: 'Song creation failed',
        statusCode: 400,
      });
    }
    return responseHelper({
      message: 'Song created successfully',
      data: createdSong,
      statusCode: 201,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('search/title')
  async searchSongs(@Query('q') query: string){
    if (!query) {
      return this.songsService.findAll();
    }
    if (query.length < 3) {
      return responseHelper({
        message: 'Query must be at least 3 characters long',
        statusCode: 400,
      });
    }
    if (query.length > 20) {
      return responseHelper({
        message: 'Query must be less than 20 characters long',
        statusCode: 400,
      });
    }
    const foundSongs = await this.songsService.search(query);
    if (!foundSongs || foundSongs.length === 0) {
      return responseHelper({
        message: 'No songs found',
        statusCode: 404,
      });
    }
    return responseHelper({
      message: 'Songs retrieved successfully',
      data: foundSongs,
      statusCode: 200,
    });

  }

  @UseGuards(JwtAuthGuard)
  @Get('search/artist')
  async searchSongsByArtist(@Query('q') artist: string) {
    if (!artist) {
      return this.songsService.findAll();
    }
    if (artist.length < 3) {
      return responseHelper({
        message: 'Query must be at least 3 characters long',
        statusCode: 400,
      });
    }
    if (artist.length > 20) {
      return responseHelper({
        message: 'Query must be less than 20 characters long',
        statusCode: 400,
      });
    }
    const foundSongs = await this.songsService.searchByArtist(artist);
    if (!foundSongs) {
      return responseHelper({
        message: 'No songs found',
        statusCode: 404,
      });
    }
    return responseHelper({
      message: 'Songs retrieved successfully',
      data: foundSongs,
      statusCode: 200,
    });
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('search/youtube')
  // searchSongsWithYoutube(@Query('y') youtubeUrl: string): Promise<Song[]> {
  //   return this.songsService.searchWithYoutube(youtubeUrl);
  // }

  // @Get('find-one')
  // findOnePrecisely(@Query('title') title: string, @Query('artistName') artistName : string): Promise<Song | null> {
  //   return this.songsService.findOnePrecisely(title, artistName);
  // }

  @UseGuards(JwtAuthGuard)
  @Get('find-one')
  findOneByName(@Query('title') title: string) {
    const foundSong = this.songsService.findOneByName(title);
    if(!foundSong) {
      return responseHelper({
        message: 'Song not found',
        statusCode: 404,
      });
    }
    return responseHelper({
      message: 'Song retrieved successfully',
      data: foundSong,
      statusCode: 200,
    });
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string){
    const foundSong = this.songsService.findOne(id);
    if(!foundSong) {
      return responseHelper({
        message: 'Song not found',
        statusCode: 404,
      });
    }
    return responseHelper({
      message: 'Song retrieved successfully',
      data: foundSong,
      statusCode: 200,
    });
  }

  

  @UseGuards(JwtAdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSongDto: UpdateSongDto){
    const updatedSong =  this.songsService.update(id, updateSongDto);
    if(!updatedSong) {
      return responseHelper({
        message: 'Song update failed',
        statusCode: 400,
      });
    }
    return responseHelper({
      message: 'Song updated successfully',
      data: updatedSong,
      statusCode: 200,
    });
  }

  @UseGuards(JwtAdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string){
    const deleteSong = this.songsService.remove(id);
    if(!deleteSong) {
      return responseHelper({
        message: 'Song deletion failed',
        statusCode: 400,
      });
    }
    return responseHelper({
      message: 'Song deleted successfully',
      data: deleteSong,
      statusCode: 200,
    });
  }




}
