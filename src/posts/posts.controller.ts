import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { responseHelper } from 'src/helpers/response.helper';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createPostDto: CreatePostDto, @Req() req: any) {
    createPostDto.userId = req.user['userId']; // set the userId from the request
    return await this.postsService.createPost(createPostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return await this.postsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Req() req: any) {
    const post = await this.postsService.findOne(id);
    if (!post) {
      return responseHelper({
        message: 'Post not found',
        statusCode: 404,
      });
    }
    if (post.user.id !== req.user['userId'] || post.user.adminSecret !== req.user['adminSecret']) {
      return responseHelper({
        message: 'You are not authorized to update this post',
        statusCode: 403,
      });
    }
    return await this.postsService.update(id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const post = await this.postsService.findOne(id);
    if (!post) {
      return responseHelper({
        message: 'Post not found',
        statusCode: 404,
      });
    }
    if (post.user.id !== req.user['userId'] || post.user.adminSecret !== req.user['adminSecret']) {
      return responseHelper({
        message: 'You are not authorized to delete this post',
        statusCode: 403,
      });
    }
    return await this.postsService.remove(id);
  }
}
