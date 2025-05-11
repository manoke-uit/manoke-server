import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { KaraokesService } from './karaokes.service';
import { CreateKaraokeDto } from './dto/create-karaoke.dto';
import { UpdateKaraokeDto } from './dto/update-karaoke.dto';
import { responseHelper } from 'src/helpers/response.helper';
import { ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin-guard';

@Controller('karaokes')
export class KaraokesController {
  constructor(private readonly karaokesService: KaraokesService) {}

  @ApiProperty({
    description: 'crete a new karaoke by user, default is private, if admin need to user another route',
  })
  @Post('users')
  @UseGuards(JwtAuthGuard)
  createByUser(@Body() createKaraokeDto: CreateKaraokeDto) {
    const createdKaraoke = this.karaokesService.createByUser(createKaraokeDto);
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
  @ApiProperty({
    description: 'crete a new karaoke by user, default is private, if admin need to user another route',
  })
  @Post('users')
  @UseGuards(JwtAdminGuard)
  createByAdmin(@Body() createKaraokeDto: CreateKaraokeDto) {
    const createdKaraoke = this.karaokesService.createByAdmin(createKaraokeDto);
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

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    const karaokes = this.karaokesService.findAll();
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

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    const karaoke= this.karaokesService.findOne(id);
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

  @ApiProperty({
    description: 'when a user want to make their karaoke public',
    example: 'can be left empty',
  })
  @UseGuards(JwtAuthGuard)
  @Get('public/:id')
  findKaraokeAndChangeStatusToPending(@Param('id') id: string) {
    const karaoke = this.karaokesService.findKaraokeAndChangeStatusToPending(id);
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

  @ApiProperty({
    description: 'when admin approve their karaoke to be public',
    example: 'can be left empty',
  })
  @Get('approve/:id')
  @UseGuards(JwtAdminGuard)
  findKaraokeAndChangeStatusToPublic(@Param('id') id: string) {
    const karaoke = this.karaokesService.findKaraokeAndChangeStatusToPublic(id);
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

  @ApiProperty({
    description: 'get all the related karaoke of a song',
  })
  @UseGuards(JwtAuthGuard)
  @Get('song/:id')
  findAllBySongId(@Param('id') id: string) {
    const karaoke = this.karaokesService.findAllBySongId(id);
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

  @ApiProperty({
    description: 'get all the related karaoke of an user',
  })
  @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  findAllByUserId(@Param('id') id: string) {
    const karaoke = this.karaokesService.findAllByUserId(id);
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKaraokeDto: UpdateKaraokeDto) {
    const updatedKaraoke =  this.karaokesService.update(id, updateKaraokeDto);
    if (!updatedKaraoke) {
      return responseHelper({
        message: 'Karaoke update failed',
        statusCode: 400,
      });
    }
    return responseHelper({
      message: 'Karaoke updated successfully',
      data: updatedKaraoke,
      statusCode: 200,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const deletedKaraoke = this.karaokesService.remove(id);
    if (!deletedKaraoke) {
      return responseHelper({
        message: 'Karaoke deletion failed',
        statusCode: 400,
      });
    }
    return responseHelper({
      message: 'Karaoke deleted successfully',
      data: deletedKaraoke,
      statusCode: 200,
    });
  }
}
