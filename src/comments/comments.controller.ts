import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin-guard';
import { response } from 'express';
import { responseHelper } from 'src/helpers/response.helper';
import { PostsService } from 'src/posts/posts.service';
import { FriendsService } from 'src/friends/friends.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService, private readonly postsService: PostsService, private readonly friendsService: FriendsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createCommentDto: CreateCommentDto, @Req() req: any) {
    createCommentDto.userId = req.user['userId']; // set the userId from the request
    // check if the post's owner is friend of the user
    const post = await this.postsService.findOne(createCommentDto.postId);
    const isFriend = await this.friendsService.getFriendList(req.user['userId']);
    
    if (!post) {
      return responseHelper({
        message: 'Post not found',
        statusCode: 404,
      });
    }
    if (!isFriend.some(friend => friend.userId_1 === post.user.id) || !isFriend.some(friend => friend.userId_2 === post.user.id)) {
      return responseHelper({
        message: 'You can only comment on posts of your friends',
        statusCode: 403,
      });
    }
    if (post.user.id !== req.user['userId'] && post.user.adminSecret !== req.user['adminSecret']) {
      return responseHelper({
        message: 'You are not authorized to comment on this post',
        statusCode: 403,
      });
    }
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
    if (comment?.user.id !== req.user['userId'] && comment?.user.adminSecret !== req.user['adminSecret']) {  
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
    if (comment?.user.id !== req.user['userId'] && comment?.user.adminSecret !== req.user['adminSecret']) {  
      return responseHelper({
        message: 'You are not authorized to delete this comment',
        statusCode: 403,
      });
    }
    return await this.commentsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('post/:postId')
  async getCommentsByPost(@Param('postId') postId: string) {
    return await this.commentsService.findByPost(postId);
  }
}
