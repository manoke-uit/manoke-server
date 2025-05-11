import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin-guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';

@Controller('scores')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Post()
  create(@Body() createScoreDto: CreateScoreDto) {
    //return this.scoresService.create(createScoreDto);
  }

  @Get()
  findAll() {
    return this.scoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scoresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScoreDto: UpdateScoreDto) {
    return this.scoresService.update(+id, updateScoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scoresService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('score')
  @UseInterceptors(FileInterceptor('file'))
  async score(@UploadedFile() file: Express.Multer.File, @Body() createScoreDto : CreateScoreDto, @Req() req: any): Promise<string> {
    createScoreDto.userId = req.user['userId']; // set the userId in the createScoreDto
    
    const fileName = file.originalname; // get the original file name
    const fileBuffer = file.buffer; // get the file buffer

    const calculatedScore =  await this.scoresService.calculateScore(fileBuffer,fileName, createScoreDto.songId);
    createScoreDto.finalScore = calculatedScore; // set the score in the DTO
    
    try {
      const savedScore =  await this.scoresService.create(createScoreDto, file.buffer); // create the score in the database
      return savedScore.finalScore.toString(); // return the id of the saved score
    }
    catch (error) {
      console.error('Error creating score:', error);
      throw new Error('Failed to create score');
    }
  }
}
