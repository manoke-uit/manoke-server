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
  DefaultValuePipe, 
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin-guard';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Artist } from './entities/artist.entity';
import { responseHelper } from 'src/helpers/response.helper';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @UseGuards(JwtAuthGuard)  
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() createArtistDto: CreateArtistDto, @UploadedFile() image?: Express.Multer.File) {
    const imageName = image?.originalname; // get the original image name
    const imageBuffer = image?.buffer; // get the file buffer
    const createdArtist = await this.artistsService.create(createArtistDto, imageBuffer, imageName);
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

  @UseGuards(JwtAuthGuard) 
  @Get()
  async findAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe)
      page: number = 1, 
      @Query('limit', new  DefaultValuePipe(10), ParseIntPipe)
      limit = 10 
    ) : Promise<Pagination<Artist>> {
    limit = limit > 100 ? 100 : limit;
      return await this.artistsService.paginate( {
          page, limit
        } 
      );
    }
  
  @UseGuards(JwtAuthGuard) 
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const foundArtist = await this.artistsService.findOne(id);
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
  @UseInterceptors(FileInterceptor('image'))
  async update(@Param('id') id: string, @Body() updateArtistDto: UpdateArtistDto, @UploadedFile() image?: Express.Multer.File) {
    const imageName = image?.originalname; // get the original image name
    const imageBuffer = image?.buffer; // get the file buffer
    const updatedArtist = await this.artistsService.update(id, updateArtistDto, imageBuffer, imageName);
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
  async remove(@Param('id') id: string) {
    const deletedArtist = await this.artistsService.remove(id);
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
