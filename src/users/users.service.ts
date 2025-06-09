import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteResult, In, Not, Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { paginate, Pagination, IPaginationOptions } from 'nestjs-typeorm-paginate'
import { Playlist } from 'src/playlists/entities/playlist.entity';
import { PlaylistsService } from 'src/playlists/playlists.service';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { UserDevice } from './entities/user-device.entity';
import Expo from 'expo-server-sdk';
import { BadRequestError } from 'openai';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly playlistsService: PlaylistsService,
    private readonly supabaseStorageService: SupabaseStorageService,
    @InjectRepository(UserDevice)
    private userDevicesRepository: Repository<UserDevice>
  ) {} // Inject the ConfigService if needed
  @InjectRepository(User) // Inject the User repository
  private readonly usersRepository: Repository<User>; // Replace 'any' with your User entity type
  

  async create(createUserDto: CreateUserDto) : Promise<User>{
    const user = new User();
    user.displayName = createUserDto.displayName;
    user.email = createUserDto.email;
    const salt = await bcrypt.genSalt(); // Generate a salt
    user.password = await bcrypt.hash(createUserDto.password, salt); // Hash the password with the salt
    user.imageUrl = createUserDto.imageUrl ? createUserDto.imageUrl : ""; // Set imageUrl to null if not provided
    user.createdAt = new Date(); // Set createdAt to the current date

    if (createUserDto.adminSecret === this.configService.get("ADMIN_SECRET")) { // Check if the adminSecret matches the one in the config
      user.adminSecret = createUserDto.adminSecret; // Set adminSecret if it matches
    }

    const savedUser = await this.usersRepository.save(user); // Save the user to the database
    //console.log(this.playlistsService.createFavouritePlaylist(createUserDto.email));


    savedUser.password = ""; // Remove the password from the saved user object
    savedUser.adminSecret = ""; // Remove the adminSecret from the saved user object
    return savedUser; // Return the saved user object
  }

  async findViaEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email } }); // Find a user by email
    if (!user) {
      throw new NotFoundException; // Return null if user not found
    }
    user.password = ""; // Remove the password from the user object
    user.adminSecret = ""; // Remove the adminSecret from the user object
    return user; // Return the user object
  }

  async registerOrUpdateExpoPushToken(userId: string, expoPushToken: string) {
    if (!Expo.isExpoPushToken(expoPushToken)) {
      throw new BadRequestException("Expo push token is invalid!")
    }

    const user = await this.usersRepository.findOneBy({id: userId});
    if (!user) {
      throw new NotFoundException("User not found!")
    }

    const userDevice = await this.userDevicesRepository.findOneBy({expoPushToken});
    if (!userDevice) {
      const newUserDevice = new UserDevice();
      newUserDevice.user = user; 
      newUserDevice.expoPushToken = expoPushToken;
      await this.userDevicesRepository.save(newUserDevice);
      //console.log(userDevice)
    } else {
      const currentUserDevice = userDevice;
      currentUserDevice.user = user;
      await this.userDevicesRepository.save(currentUserDevice);
      //console.log(userDevice)
    }
  } 

  async getExpoPushTokens(userId: string) {
  const userDevice = await this.userDevicesRepository.find({
    where: { user: { id: userId } },
    select: ['expoPushToken'],
    relations: ['user']
  });

  if (!userDevice) {
    throw new NotFoundException('User device not found!');
  }

  return userDevice.map(device => device.expoPushToken);
}

  async findByEmail(email: string): Promise<User | null> {
  const user = await this.usersRepository.findOne({ where: { email } });
  return user;
}

  async findByDisplayName(displayName: string): Promise<User> {
  const user = await this.usersRepository.findOne({ where: { displayName } });
  if (!user) throw new NotFoundException('User not found');
  return user;
}

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find(); // Find all users
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, imageBuffer?: Buffer, imageName?: string) {
  const user = await this.usersRepository.findOneBy({ id });
  if (!user) throw new NotFoundException('User not found');

  user.displayName = updateUserDto.displayName ?? user.displayName;
  user.email = updateUserDto.email ?? user.email;

  if (imageBuffer && imageName) {
    const fileName = `${sanitizeFileName(imageName)}-${Date.now()}.jpg`;
    try {
      const uploadedImageUrl = await this.supabaseStorageService.uploadAvatarFromBuffer(imageBuffer, fileName);
      if (uploadedImageUrl) {
        user.imageUrl = uploadedImageUrl;
      } else {
        throw new Error('Failed to upload image to Supabase Storage');
      }
    } catch (error) {
      throw new Error('Error uploading image: ' + error.message);
    }
  }
  return await this.usersRepository.save(user);
}

  async remove(id: string): Promise<DeleteResult>  {
    return await this.usersRepository.delete(id);
  }

  paginate(options: IPaginationOptions): Promise<Pagination<User>> {
    return paginate<User>(this.usersRepository, options);
  }
}

function sanitizeFileName(title: string): string {
  return title
    .normalize('NFD')                     // Convert to base letters + accents
    .replace(/[\u0300-\u036f]/g, '')     // Remove accents
    .replace(/[^a-zA-Z0-9-_ ]/g, '')     // Remove special characters
    .replace(/\s+/g, '-')                // Replace spaces with hyphens
    .toLowerCase();                      // Optional: lowercase everything
}