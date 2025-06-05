import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin-guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CreateNotificationDto } from 'src/notifications/dto/create-notification.dto';

@Controller('scores')
export class ScoresController {
  constructor(
    private readonly scoresService: ScoresService,
    private readonly notificationService: NotificationsService, 
    // private sendNotificationDto: SendNotificationDto
  ) {}

  @Post()
  create(@Body() createScoreDto: CreateScoreDto) {
    //return this.scoresService.create(createScoreDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: any) {
    // Check if the user is an admin
    if (req.user['adminSecret']) {
      return await this.scoresService.findAllForAdmin();
    }
    const userId = req.user['userId'];
    return await this.scoresService.findAll(userId);
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
  async score(@UploadedFile() file: Express.Multer.File, @Body() createScoreDto : CreateScoreDto, @Req() req: any, createNotificationDto: CreateNotificationDto): Promise<string> {
    createScoreDto.userId = req.user['userId']; // set the userId in the createScoreDto
    
    const fileName = file.originalname; // get the original file name
    const fileBuffer = file.buffer; // get the file buffer
    

    const calculatedScore =  await this.scoresService.calculateScore(fileBuffer,fileName, createScoreDto.songId);
    if (calculatedScore == -1){
      return "Please sing more than 30 seconds!";
    }
    createScoreDto.finalScore = calculatedScore; // set the score in the DTO
    
    try {
      const savedScore =  await this.scoresService.create(createScoreDto, file.buffer); // create the score in the database

      createNotificationDto.title = "Complete calculating score!";
      createNotificationDto.description = "Hello! Your score has been calculated. Please enter the app to receive your achievement!"
      createNotificationDto.userId = req.user['userId'];
      createNotificationDto.isRead = false;
      
      await this.notificationService.sendNotificationToUser(createNotificationDto);

      return savedScore.finalScore.toString(); // return the id of the saved score
    }
    catch (error) {
      console.error('Error creating score:', error);
      throw new Error('Failed to create score');
    }
  }
}
