import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe, 
  UseGuards, 
  Query, 
  DefaultValuePipe 
} from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin-guard';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Artist } from './entities/artist.entity';
import { responseHelper } from 'src/helpers/response.helper';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @UseGuards(JwtAdminGuard)  
  @Post()
  create(@Body() createArtistDto: CreateArtistDto) {
    const createdArtist = this.artistsService.create(createArtistDto);
    if(!createdArtist) {
      return responseHelper({
        message: 'Artist creation failed',
        statusCode: 400,
      });
    }
    return responseHelper({
      message: 'Artist created successfully',
      data: createdArtist,
      statusCode: 201,
    });
  }

  @Get()
  findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe)
      page: number = 1, 
      @Query('limit', new  DefaultValuePipe(10), ParseIntPipe)
      limit = 10 
    ) : Promise<Pagination<Artist>> {
    limit = limit > 100 ? 100 : limit;
      return this.artistsService.paginate( {
          page, limit
        } 
      );
    }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    const foundArtist = this.artistsService.findOne(id);
    if(!foundArtist) {
      return responseHelper({
        message: 'Artist not found',
        statusCode: 404,
      });
    }
    return responseHelper({
      message: 'Artist found successfully',
      data: foundArtist,
      statusCode: 200,
    });
  }

  @UseGuards(JwtAdminGuard)  
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArtistDto: UpdateArtistDto) {
    const updatedArtist = this.artistsService.update(id, updateArtistDto);
    if(!updatedArtist) {
      return responseHelper({
        message: 'Artist update failed',
        statusCode: 400,
      });
    }
    return responseHelper({
      message: 'Artist updated successfully',
      data: updatedArtist,
      statusCode: 200,
    });
  }

  @UseGuards(JwtAdminGuard)  
  @Delete(':id')
  remove(@Param('id') id: string) {
    const deletedArtist = this.artistsService.remove(id);
    if(!deletedArtist) {
      return responseHelper({
        message: 'Artist deletion failed',
        statusCode: 400,
      });
    }
    return responseHelper({
      message: 'Artist deleted successfully',
      data: deletedArtist,
      statusCode: 200,
    });
  }
}
