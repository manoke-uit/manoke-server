import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin-guard';
import { response } from 'express';
import { responseHelper } from 'src/helpers/response.helper';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createCommentDto: CreateCommentDto, @Req() req: any) {
    createCommentDto.userId = req.user['userId']; // set the userId from the request
    return await this.commentsService.createComment(createCommentDto);
  }

  // where is the function for getting all comments for a specific post?

  @UseGuards(JwtAdminGuard)
  @Get()
  async findAll() {
    return await this.commentsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.commentsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @Req() req: any) {
    const comment = await this.commentsService.findOne(id);
    const userId = req.user['userId'];
    if (comment?.user.id !== req.user['userId'] || comment?.user.adminSecret !== req.user['adminSecret']) {  
      return responseHelper({
        message: 'You are not authorized to update this comment',
        statusCode: 403,
      });
    }

    return await this.commentsService.update(id, userId, updateCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const comment = await this.commentsService.findOne(id);
    if (comment?.user.id !== req.user['userId'] || comment?.user.adminSecret !== req.user['adminSecret']) {  
      return responseHelper({
        message: 'You are not authorized to delete this comment',
        statusCode: 403,
      });
    }
    return await this.commentsService.remove(id);
  }
}
