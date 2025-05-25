import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Req, 
  UseGuards 
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Friend } from './entities/friend.entity';
import { UpdateResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { RequestWithUser } from 'src/interfaces/request-with-user.interface';
// import { Request } from 'express';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Req() req: RequestWithUser,
    @Body() createFriendDto: CreateFriendDto
  ): Promise<Friend> {
    const currentUserId = req.user['userId'];
    return this.friendsService.sendFriendRequest(currentUserId, createFriendDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getFriendList(@Req() req: RequestWithUser): Promise<Friend[]> {
    const currentUserId = req.user['userId'];
    return this.friendsService.getFriendList(currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('requests')
  findAll(@Req() req: RequestWithUser): Promise<Friend[]> {
    const currentUserId = req.user['userId'];
    return this.friendsService.getRequests(currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':idToFind')
  findOne(
    @Param('idToFind') idToFind: string,
    @Req() req: RequestWithUser,
  ): Promise<Friend | null> {
    const currentUserId = req.user['userId'];
    return this.friendsService.findOne(currentUserId, idToFind);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateFriendRequestStatus(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateFriendDto: UpdateFriendDto
  ): Promise<UpdateResult> {
    const currentUserId = req.user['userId'];
    // Check if the user is the one who sent the friend request
    return this.friendsService.updateStatus(currentUserId, id, updateFriendDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Req() req: RequestWithUser, 
    @Param('id') id: string
  ) {
    const currentUserId = req.user['userId'];
    return this.friendsService.removeFriend(currentUserId, id);
  }
}
