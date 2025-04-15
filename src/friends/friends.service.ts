import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Friend, FriendStatus } from './entities/friend.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>, 
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createFriendDto: CreateFriendDto): Promise<Friend> {
    const {userId_1, userId_2, status, createdAt} = createFriendDto;

    const [fromId, toId] = [userId_1, userId_2].sort();

    if (fromId === toId) {
      throw new BadRequestException("You can't add yourself as a friend");
    }

    // Check if user1 or user2 is existed
    const [user1, user2] = await Promise.all([
      this.userRepository.findOneBy({id: fromId}), 
      this.userRepository.findOneBy({id: toId}), 
    ])

    if (!user1 || !user2) {
      throw new BadRequestException("One of the two users does not exist");
    }

    const existing = await this.friendRepository.findOne({
      where: [
        { userId_1, userId_2 },
        { userId_1: userId_2, userId_2: userId_1 },
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

  async findAll(): Promise<Friend[]> {
    return this.friendRepository.find({
      relations: ['user_1', 'user_2']
    });
  }

  async findOne(userId_1: string, userId_2: string): Promise<Friend | null> {
    const [fromId, toId] = [userId_1, userId_2].sort();

    const friend = await this.friendRepository.findOne({
      where: {
        userId_1: fromId,
        userId_2: toId,
      },
      relations: ['user_1', 'user_2'],
    });

    if (!friend)
      throw new NotFoundException('Friend not found')

    return friend;
  }

  update(id: string, updateFriendDto: UpdateFriendDto) {
    return `This action updates a #${id} friend`; 
  }

  remove(id: string) {
    return `This action removes a #${id} friend`;
  }
}
