import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, DefaultValuePipe, ParseIntPipe, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin-guard';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Song } from './entities/song.entity';
import { DeleteResult, UpdateResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ScoresService } from 'src/scores/scores.service';
import { response } from 'express';
import { responseHelper } from 'src/helpers/response.helper';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ar, fi } from '@faker-js/faker/.';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]))
  async create(@UploadedFiles() files: {audio: Express.Multer.File[], image?: Express.Multer.File[]},@Body() createSongDto: CreateSongDto) {
    const fileAudio = files.audio?.[0]; // get the file
    if (!fileAudio) {
      return responseHelper({
        message: 'Audio file is required',
        statusCode: 400,
      });
    }
    const fileImage = files.image?.[0]; // get the image file
    
    const fileAudioName = fileAudio.originalname; // get the file name
    const fileAudioBuffer = fileAudio.buffer; // get the file buffer
    const fileImageName = fileImage?.originalname; // get the image file name
    const fileImageBuffer = fileImage?.buffer; // get the image file buffer
    const createdSong = await this.songsService.create(fileAudioBuffer, fileAudioName, createSongDto, fileImageBuffer, fileImageName);
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

  @ApiOperation({ summary: 'Add an artist id to the song'})
  @UseGuards(JwtAuthGuard)
  @Get('artists/:id')
  async addArtistToSong(@Param('id') id: string, @Query('artistId') artistId: string) {
    const updatedSong = await this.songsService.addArtistToSong(id, artistId);
    if(!updatedSong) {
      return responseHelper({
        message: 'Artist connection failed',
        statusCode: 400,
      });
    }
    return responseHelper({
      message: 'Artist connection added successfully',
      data: updatedSong,
      statusCode: 200,
    });
  }

  @ApiOperation({ summary: 'Add a genre id to the song'})
  @UseGuards(JwtAuthGuard)
  @Get('genres/:id')
  async addGenreToSong(@Param('id') id: string, @Query('genreId') genreId: string) {
    const updatedSong = await this.songsService.addGenreToSong(id, genreId);
    if(!updatedSong) {
      return responseHelper({
        message: 'Genre connection failed',
        statusCode: 400,
      });
    }
    return responseHelper({
      message: 'Genre connection added successfully',
      data: updatedSong,
      statusCode: 200,
    });
  }

  @ApiOperation({ summary: 'Remove an artist id from the song'})
  @UseGuards(JwtAuthGuard)
  @Delete('artists/:id')
  async deleteArtistFromSong(@Param('id') id: string, @Query('artistId') artistId: string) {
    const updatedSong = await this.songsService.removeArtistFromSong(id, artistId);
    if(!updatedSong) {
      return responseHelper({
        message: 'Artist deletion failed',
        statusCode: 400,
      });
    }
    return responseHelper({
      message: 'Artist deeltion successfully',
      data: updatedSong,
      statusCode: 200,
    });
  }

  @ApiOperation({ summary: 'Remove a genre id from the song'})
  @UseGuards(JwtAuthGuard)
  @Delete('genres/:id')
  async deleteGenreFromSong(@Param('id') id: string, @Query('genreId')genreId: string) {
    const updatedSong = await this.songsService.removeGenreFromSong(id,genreId);
    if(!updatedSong) {
      return responseHelper({
        message: 'Genre deletion failed',
        statusCode: 400,
      });
    }
    return responseHelper({
      message: 'Genre deletion successfully',
      data: updatedSong,
      statusCode: 200,
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
    if (artist.length < 1) {
      return responseHelper({
        message: 'Query must be at least 1 characters long',
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

  // @UseGuards(JwtAuthGuard)
  // @Get('find-one')
  // async findOneByName(@Query('title') title: string) {
  //   const foundSong = await this.songsService.findOneByName(title);
  //   if(!foundSong) {
  //     return responseHelper({
  //       message: 'Song not found',
  //       statusCode: 404,
  //     });
  //   }
  //   return responseHelper({
  //     message: 'Song retrieved successfully',
  //     data: foundSong,
  //     statusCode: 200,
  //   });
  // }

  // @UseGuards(JwtAuthGuard)
  // @Get()
  // async findAll(
  //     @Query('page', new DefaultValuePipe(1), ParseIntPipe)
  //     page: number = 1, 
  //     @Query('limit', new  DefaultValuePipe(10), ParseIntPipe)
  //     limit = 10 
  //   ) : Promise<Pagination<Song>> {
  //     limit = limit > 100 ? 100 : limit;
  //     return await this.songsService.paginate( {
  //         page, limit
  //       } 
  //     );
  //   }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiQuery({ name: 'genreId', required: false })
  @ApiQuery({ name: 'artistId', required: false })
  async findAll(@Query('genreId' ) genreId?: string, @Query('artistId') artistId?: string) {
    if(!genreId && !artistId) {
      const songs = await this.songsService.findAll();
      if(!songs) {
        return responseHelper({
          message: 'No songs found',
          statusCode: 404,
        });
      }
      return responseHelper({
        message: 'Songs retrieved successfully',
        data: songs,
        statusCode: 200,
      });
    }
    if(genreId) {
      const songs = await this.songsService.findAllByGenre(genreId);
      if(!songs) {
        return responseHelper({
          message: 'No songs found',
          statusCode: 404,
        });
      }
      return responseHelper({
        message: 'Songs retrieved successfully',
        data: songs,
        statusCode: 200,
      });
    }
    if(artistId) {
      const songs = await this.songsService.findAllByArtist(artistId);
      if(!songs) {
        return responseHelper({
          message: 'No songs found',
          statusCode: 404,
        });
      }
      return responseHelper({
        message: 'Songs retrieved successfully',
        data: songs,
        statusCode: 200,
      });
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @Get()
  // async findAll(){
  //   const songs = await this.songsService.findAll();
  //   if(!songs) {
  //     return responseHelper({
  //       message: 'No songs found',
  //       statusCode: 404,
  //     });
  //   }
  //   return responseHelper({
  //     message: 'Songs retrieved successfully',
  //     data: songs,
  //     statusCode: 200,
  //   });
  // }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string){
    const foundSong = await this.songsService.findOne(id);
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
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]))
  async update(@Param('id') id: string,@UploadedFiles() files: {audio?: Express.Multer.File[], image?: Express.Multer.File[]}  ,@Body() updateSongDto: UpdateSongDto){
    const fileAudio = files.audio?.[0]; // get the file
    
    const fileImage = files.image?.[0]; // get the image file
    
    const fileAudioName = fileAudio?.originalname; // get the file name
    const fileAudioBuffer = fileAudio?.buffer; // get the file buffer
    const fileImageName = fileImage?.originalname; // get the image file name
    const fileImageBuffer = fileImage?.buffer; // get the image file buffer
    const updatedSong = await this.songsService.update(id, updateSongDto, fileAudioBuffer, fileAudioName, fileImageBuffer, fileImageName);
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
  async remove(@Param('id') id: string){
    const deleteSong = await this.songsService.remove(id);
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
