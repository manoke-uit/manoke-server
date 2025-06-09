import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { KaraokesService } from './karaokes.service';
import { CreateKaraokeDto } from './dto/create-karaoke.dto';
import { UpdateKaraokeDto } from './dto/update-karaoke.dto';
import { responseHelper } from 'src/helpers/response.helper';
import { ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin-guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

@Controller('karaokes')
export class KaraokesController {
  constructor(private readonly karaokesService: KaraokesService) { }

  @ApiOperation({ summary: 'create a new karaoke by user, default is private, if admin need to user another route' })
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async createByUser(@UploadedFile() file: Express.Multer.File, @Body() createKaraokeDto: CreateKaraokeDto, @Req() req: any) {
    const fileName = file.originalname; // get the original file name
    const fileBuffer = file.buffer; // get the file buffer
    createKaraokeDto.userId = req.user['userId']; // set the userId in the createKaraokeDto
    if (req.user['adminSecret']) {
      const createdKaraoke = await this.karaokesService.createByAdmin(fileBuffer, fileName, createKaraokeDto);
      if (!createdKaraoke) {
        return responseHelper({
          message: 'Karaoke creation failed',
          statusCode: 400,
        });
      }
      return responseHelper({
        message: 'Karaoke created successfully',
        data: createdKaraoke,
        statusCode: 201,
      });
    }
    else {
      const createdKaraoke = await this.karaokesService.createByUser(fileBuffer, fileName, createKaraokeDto);
      if (!createdKaraoke) {
        return responseHelper({
          message: 'Karaoke creation failed',
          statusCode: 400,
        });
      }
      return responseHelper({
        message: 'Karaoke created successfully',
        data: createdKaraoke,
        statusCode: 201,
      });
    }

  }


  // @ApiOperation({ summary: 'create a new karaoke by admin => Public' })
  // @Post('admin')
  // @UseGuards(JwtAdminGuard)
  // @UseInterceptors(FileInterceptor('file'))
  // async createByAdmin(@UploadedFile() file: Express.Multer.File,@Body() createKaraokeDto: CreateKaraokeDto, @Req() req: any) {
  //   createKaraokeDto.userId = req.user['userId'];
  //   const fileName = file.originalname; // get the original file name
  //   const fileBuffer = file.buffer; // get the file buffer
  //   const createdKaraoke = await this.karaokesService.createByAdmin(fileBuffer, fileName,createKaraokeDto);
  //   if (!createdKaraoke) {
  //     return responseHelper({
  //       message: 'Karaoke creation failed',
  //       statusCode: 400,
  //     });
  //   }
  //   return responseHelper({
  //     message: 'Karaoke created successfully',
  //     data: createdKaraoke,
  //     statusCode: 201,
  //   });
  // }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    const karaokes = await this.karaokesService.findAll();
    if (!karaokes) {
      return responseHelper({
        message: 'No karaokes found',
        statusCode: 404,
      });
    }
    return responseHelper({
      message: 'Karaokes retrieved successfully',
      data: karaokes,
      statusCode: 200,
    });
  }

  @ApiOperation({ summary: 'Get all related karaoke of an user' })
  @ApiResponse({ status: 200, description: 'Karaoke retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Karaoke not found' })
  @UseGuards(JwtAuthGuard)
  @Get('own')
  async findAllByUserId(@Req() req: any) {
    const id = req.user['userId'];
    const karaoke = await this.karaokesService.findAllByUserId(id);
    // console.log('id', id);
    // console.log('karaoke', karaoke);
    if (!karaoke) {
      return responseHelper({
        message: 'Karaoke not found',
        statusCode: 404,
      });
    }
    return responseHelper({
      message: 'Karaoke retrieved successfully',
      data: karaoke,
      statusCode: 200,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const karaoke = await this.karaokesService.findOne(id);
    if (!karaoke) {
      return responseHelper({
        message: 'Karaoke not found',
        statusCode: 404,
      });
    }
    return responseHelper({
      message: 'Karaoke retrieved successfully',
      data: karaoke,
      statusCode: 200,
    });
  }

  @ApiOperation({ summary: 'when a user want to make their karaoke public' })
  @UseGuards(JwtAuthGuard)
  @Get('public/:id')
  async findKaraokeAndChangeStatusToPending(@Param('id') id: string) {
    const karaoke = await this.karaokesService.findKaraokeAndChangeStatusToPending(id);
    if (!karaoke) {
      return responseHelper({
        message: 'Karaoke not found',
        statusCode: 404,
      });
    }
    return responseHelper({
      message: 'Karaoke retrieved successfully',
      data: karaoke,
      statusCode: 200,
    });
  }

  @ApiOperation({ summary: 'when admin approve their karaoke to be public' })
  @Get('approve/:id')
  @UseGuards(JwtAdminGuard)
  async findKaraokeAndChangeStatusToPublic(@Param('id') id: string) {
    const karaoke = await this.karaokesService.findKaraokeAndChangeStatusToPublic(id);
    if (!karaoke) {
      return responseHelper({
        message: 'sth wrong',
        statusCode: 404,
      });
    }
    return responseHelper({
      message: 'Karaoke updated successfully',
      data: karaoke,
      statusCode: 200,
    });
  }

  @ApiOperation({ summary: 'when admin decline and the karaoke backs to be private' })
  @Get('decline/:id')
  @UseGuards(JwtAdminGuard)
  async findKaraokeAndChangeStatusToPrivate(@Param('id') id: string) {
    const karaoke = await this.karaokesService.findKaraokeAndChangeStatusToPrivate(id);
    if (!karaoke) {
      return responseHelper({
        message: 'sth wrong',
        statusCode: 404,
      });
    }
    return responseHelper({
      message: 'Karaoke updated successfully',
      data: karaoke,
      statusCode: 200,
    });
  }

  @ApiOperation({ summary: 'Get all related karaoke of a song' })
  @ApiResponse({ status: 200, description: 'Karaoke retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Karaoke not found' })
  @UseGuards(JwtAuthGuard)
  @Get('song/:id')
  async findAllBySongId(@Param('id') id: string) {
    const karaoke = await this.karaokesService.findAllBySongId(id);
    if (!karaoke) {
      return responseHelper({
        message: 'Karaoke not found',
        statusCode: 404,
      });
    }
    return responseHelper({
      message: 'Karaoke retrieved successfully',
      data: karaoke,
      statusCode: 200,
    });
  }



  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(@Param('id') id: string, @Body() updateKaraokeDto: UpdateKaraokeDto, @Req() req: any, @UploadedFile() file?: Express.Multer.File) {
    const karaoke = await this.karaokesService.findOne(id);
    const fileName = file?.originalname;
    const fileBuffer = file?.buffer;
    const isOwner = karaoke?.user.id === req.user['userId'];

    const isAdmin = 
      req.user['adminSecret']
    if (!isOwner && !isAdmin) {
      return {
        statusCode: 403,
        message: 'You are not authorized to update this karaoke',
      };
    }
    const updatedKaraoke = await this.karaokesService.update(id, updateKaraokeDto, fileBuffer, fileName);
    if (!updatedKaraoke) {
      return {
        statusCode: 400,
        message: 'Karaoke update failed',
      };
    }
    return responseHelper({
      message: 'Karaoke updated successfully',
      data: updatedKaraoke,
      statusCode: 200,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const karaoke = await this.karaokesService.findOne(id);
    const isOwner = karaoke?.user.id === req.user['userId'];
    const isAdmin =
      karaoke?.user.adminSecret &&
      req.user['adminSecret'] &&
      karaoke.user.adminSecret === req.user['adminSecret'];
    if (!isOwner && !isAdmin) {
      return {
        statusCode: 403,
        message: 'You are not authorized to delete this karaoke',
      };
    }
    const deletedKaraoke = await this.karaokesService.remove(id);
    if (!deletedKaraoke) {
      return {
        statusCode: 400,
        message: 'Karaoke deletion failed',
      };
    }
    return responseHelper({
      message: 'Karaoke deleted successfully',
      data: deletedKaraoke,
      statusCode: 200,
    });
  }
}
