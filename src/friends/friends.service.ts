import { 
  BadRequestException, 
  ForbiddenException, 
  Injectable, 
  NotFoundException 
} from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Friend, FriendStatus } from './entities/friend.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { UpdateRequest } from 'firebase-admin/lib/auth/auth-config';
import { from } from 'form-data';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) { }

  // Send a friend request
  async sendFriendRequest(
    currentUserId: string, 
    createFriendDto: CreateFriendDto
  ): Promise<Friend> {
    const { receiverId } = createFriendDto;

    const [fromId, toId] = [currentUserId, receiverId];

    if (fromId === toId) {
      throw new BadRequestException("You can't add yourself as a friend");
    }

    // Check if user1 or user2 is existed
    const [user1, user2] = await Promise.all([
      this.userRepository.findOneBy({ id: fromId }),
      this.userRepository.findOneBy({ id: toId }),
    ])

    if (!user1 || !user2) {
      throw new BadRequestException("One of the two users does not exist");
    }

    const existing = await this.friendRepository.findOne({
      where: [
        { 
          userId_1: currentUserId, 
          userId_2: receiverId, 
          status: FriendStatus.PENDING
        },
        { 
          userId_1: receiverId, 
          userId_2: currentUserId, 
          status: FriendStatus.PENDING
        },
      ],
    });

    // Check if the relationship exists
    if (existing) {
        throw new BadRequestException('Friend request already exists or you are already friends');
    }

    const friend = this.friendRepository.create({
      userId_1: fromId,
      userId_2: toId,
      status: FriendStatus.PENDING,
      user_1: user1,
      user_2: user2
    })

    return this.friendRepository.save(friend);
  }

  // Find all friends who are accepted
  async getFriendList(currentUserId: string): Promise<Friend[]> {
    const allFriends = this.friendRepository.find({
      where: [
        { 
          userId_1: currentUserId, 
          status: FriendStatus.ACCEPTED          
        }, 
        { 
          userId_2: currentUserId, 
          status: FriendStatus.ACCEPTED  
        }, 
      ], 
      relations: [ 'user_1', 'user_2' ]
    })
    return allFriends;
  }

  // Find all friends who are accepted
  async getRequests(currentUserId: string): Promise<Friend[]> {
    const allRequests = this.friendRepository.find({
      where: [
        { 
          userId_1: currentUserId, 
          status: FriendStatus.PENDING  
        }, 
        { 
          userId_2: currentUserId, 
          status: FriendStatus.PENDING  
        }, 
      ], 
      relations: [ 'user_1', 'user_2' ]
    })
    return allRequests;
  }

  // Find one friend
  async findOne(
    currentUserId: string, 
    idToFind: string
  ): Promise<Friend | null> {
    const [fromId, toId] = [currentUserId, idToFind];

    console.log(fromId)
    console.log(toId)

    return this.friendRepository.findOne({
      where: [
        { 
          userId_1: fromId, 
          userId_2: toId, 
          status: FriendStatus.ACCEPTED 
        }, 
        { 
          userId_1: toId, 
          userId_2: fromId, 
          status: FriendStatus.ACCEPTED 
        }, 
      ], 
      relations: ['user_1', 'user_2']
    })
  }

  // Update status: rejected or accepted
  async updateStatus(currentUserId: string, updateFriendDto: UpdateFriendDto): Promise<UpdateResult> {
    const { receiverId, status } = updateFriendDto;
    const [fromId, toId] = [currentUserId, receiverId];

    const pendingRequest = await this.friendRepository.findOne({
      where: [
        { 
          userId_1: fromId, 
          userId_2: toId, 
          status: FriendStatus.PENDING 
        }, 
        { 
          userId_1: toId, 
          userId_2: fromId, 
          status: FriendStatus.PENDING 
        }, 
      ]
    })

    // console.log(friend)

    if (!pendingRequest) {
      throw new NotFoundException('Cannot find the relationship to modify!')
    }

    // Only receiver can reject or accept the request
    // Only receiver can reject or accept the request
    if (pendingRequest.userId_2 !== currentUserId) {
      throw new ForbiddenException('Only the receiver can reject or accept the request!');
    }


    if (pendingRequest.status === FriendStatus.ACCEPTED) {
      throw new ForbiddenException('Already be friends')
    }

    if (status === FriendStatus.ACCEPTED) {
      pendingRequest.status = FriendStatus.ACCEPTED;

      const blockedRequest = await this.friendRepository.findOne({
        where: [
          { userId_1: fromId, 
            userId_2: toId, 
            status: FriendStatus.BLOCKED 
          }, 
          { userId_1: toId, 
            userId_2: fromId, 
            status: FriendStatus.BLOCKED 
          }, 
        ]
      })
      
      if (blockedRequest) {
        await this.friendRepository.delete({
          userId_1: blockedRequest?.userId_1, 
          userId_2: blockedRequest?.userId_2, 
          status: FriendStatus.BLOCKED
        })
      }

    } else if (status === FriendStatus.BLOCKED) {
      pendingRequest.status = FriendStatus.BLOCKED;
    } else {
      throw new BadRequestException('Invalid status');
    }

    return this.friendRepository.update(
      { 
        userId_1: pendingRequest.userId_1, 
        userId_2: pendingRequest.userId_2 
      },
      {
        status 
      }
    )
  }

  async removeFriend(currentUserId: string, idToRemove: string): Promise<DeleteResult> {
    const [fromId, toId] = [currentUserId, idToRemove];
    
    if (idToRemove === fromId) {
      throw new ForbiddenException("You can't delete yourself!.");
    }

    // Avoid deleting pending request from the one who receive the friend requests
    const isReceiverOfPending = await this.friendRepository.findOne({
      where: {
        userId_1: toId, 
        userId_2: fromId, 
        status: FriendStatus.PENDING
      }
    })

    if(isReceiverOfPending != null) {
      throw new ForbiddenException("You are not allowed to cancel this friend request.");
    }


    return this.friendRepository
      .createQueryBuilder()
      .delete()
      .from(Friend)
      .where(
        `(userId_1 = :fromId AND userId_2 = :toId AND (status = :accepted OR status = :pending)) 
          OR 
        (userId_1 = :toId AND userId_2 = :fromId AND (status = :accepted OR status = :pending))`,
        {
          fromId,
          toId,
          accepted: FriendStatus.ACCEPTED,
          pending: FriendStatus.PENDING,
        }
      )
      .execute();
  }
}
