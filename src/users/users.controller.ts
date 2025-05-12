import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, ParseIntPipe, Query, DefaultValuePipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAdminGuard } from 'src/auth/guards/jwt-admin-guard';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { UpdateResult } from 'typeorm';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAdminGuard)
  @HttpCode(200)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number = 1, 
    @Query('limit', new  DefaultValuePipe(10), ParseIntPipe)
    limit = 10 
  ) : Promise<Pagination<User>> {
    limit = limit > 100 ? 100 : limit;
    return await this.usersService.paginate( {
        page, limit
      } 
    );
  }

  @Get()
  async findOneEmail() : Promise<User | null> {
    return await this.usersService.findByEmail("test"); // TODO: remove this line and implement the actual logic

  }



  // @Get()
  // @UseGuards(JwtAdminGuard)
  // @HttpCode(200)
  // async findAll() : Promise<User[]> {
  //   return await this.usersService.findAll();
  // }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    return await this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UpdateResult> {
    return await this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }
}
