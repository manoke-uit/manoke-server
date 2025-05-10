import { PartialType } from '@nestjs/swagger';
import { CreateKaraokeDto } from './create-karaoke.dto';

export class UpdateKaraokeDto extends PartialType(CreateKaraokeDto) {}
