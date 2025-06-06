import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin-guard';
import { responseHelper } from 'src/helpers/response.helper';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';

@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @UseGuards(JwtAdminGuard)
  @Post()
  async create(@Body() createGenreDto: CreateGenreDto) {
    const createdGenre = await this.genresService.create(createGenreDto);
    if(!createdGenre) {
      return responseHelper({
        message: 'Genre creation failed',
        statusCode: 400,
      });
    }
    return responseHelper({
      message: 'Genre created successfully',
      data: createdGenre,
      statusCode: 201,
    });

  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    const genres = await this.genresService.findAll();
    if(!genres) {
      return responseHelper({
        message: 'No genres found',
        statusCode: 404,
      });
    }
    return responseHelper({
      message: 'Genres retrieved successfully',
      data: genres,
      statusCode: 200,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const genre = await this.genresService.findOne(id);
    if(!genre) {
      return responseHelper({
        message: 'Genre not found',
        statusCode: 404,
      });
    }
    return responseHelper({
      message: 'Genre retrieved successfully',
      data: genre,
      statusCode: 200,
    });
  }

  @UseGuards(JwtAdminGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateGenreDto: UpdateGenreDto) {
    const updatedGenre = await this.genresService.update(id, updateGenreDto);
    if(!updatedGenre) {
      return responseHelper({
        message: 'Genre update failed',
        statusCode: 400,
      });
    }
    return responseHelper({
      message: 'Genre updated successfully',
      data: updatedGenre,
      statusCode: 200,
    });
  }

  @UseGuards(JwtAdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedGenre = await this.genresService.remove(id);
    if(!deletedGenre) {
      return responseHelper({
        message: 'Genre deletion failed',
        statusCode: 400,
      });
    }
    return responseHelper({
      message: 'Genre deleted successfully',
      data: deletedGenre,
      statusCode: 200,
    });
  }
}
