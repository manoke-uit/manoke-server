import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { paginate, Pagination, IPaginationOptions } from 'nestjs-typeorm-paginate'
import { Playlist } from 'src/playlists/entities/playlist.entity';
import { PlaylistsService } from 'src/playlists/playlists.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly playlistsService: PlaylistsService
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
    console.log(this.playlistsService.createFavouritePlaylist(createUserDto.email));


    savedUser.password = ""; // Remove the password from the saved user object
    savedUser.adminSecret = ""; // Remove the adminSecret from the saved user object
    return savedUser; // Return the saved user object
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } }); // Find a user by email
  }

  async findByDisplayName(displayName: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { displayName } }); // Find a user by display name
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find(); // Find all users
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  update(id: string, updateUserDto: UpdateUserDto): Promise<UpdateResult> {
    return this.usersRepository.update(id, updateUserDto);
  }

  remove(id: string): Promise<DeleteResult>  {
    return this.usersRepository.delete(id);
  }

  paginate(options: IPaginationOptions): Promise<Pagination<User>> {
    return paginate<User>(this.usersRepository, options);
  }
}
