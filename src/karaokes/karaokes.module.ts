import { Module } from '@nestjs/common';
import { KaraokesService } from './karaokes.service';
import { KaraokesController } from './karaokes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Karaoke } from './entities/karaoke.entity';
import { User } from 'src/users/entities/user.entity';
import { Song } from 'src/songs/entities/song.entity';
import { SupabaseStorageModule } from 'src/supabase-storage/supabase-storage.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Karaoke, Song, User]), SupabaseStorageModule],
  controllers: [KaraokesController],
  providers: [KaraokesService],
})
export class KaraokesModule {}
