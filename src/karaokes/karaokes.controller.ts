import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { KaraokesService } from './karaokes.service';
import { CreateKaraokeDto } from './dto/create-karaoke.dto';
import { UpdateKaraokeDto } from './dto/update-karaoke.dto';

@Controller('karaokes')
export class KaraokesController {
  constructor(private readonly karaokesService: KaraokesService) {}

  @Post()
  create(@Body() createKaraokeDto: CreateKaraokeDto) {
    return this.karaokesService.create(createKaraokeDto);
  }

  @Get()
  findAll() {
    return this.karaokesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.karaokesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKaraokeDto: UpdateKaraokeDto) {
    return this.karaokesService.update(+id, updateKaraokeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.karaokesService.remove(+id);
  }
}
