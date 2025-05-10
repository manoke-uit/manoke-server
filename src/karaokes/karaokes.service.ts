import { Injectable } from '@nestjs/common';
import { CreateKaraokeDto } from './dto/create-karaoke.dto';
import { UpdateKaraokeDto } from './dto/update-karaoke.dto';

@Injectable()
export class KaraokesService {
  create(createKaraokeDto: CreateKaraokeDto) {
    return 'This action adds a new karaoke';
  }

  findAll() {
    return `This action returns all karaokes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} karaoke`;
  }

  update(id: number, updateKaraokeDto: UpdateKaraokeDto) {
    return `This action updates a #${id} karaoke`;
  }

  remove(id: number) {
    return `This action removes a #${id} karaoke`;
  }
}
