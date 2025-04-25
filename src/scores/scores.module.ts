import { Module } from '@nestjs/common';
import { ScoresService } from './scores.service';
import { ScoresController } from './scores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Score } from './entities/score.entity';
import { SongsModule } from 'src/songs/songs.module';
import { UsersModule } from 'src/users/users.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupabaseStorageModule } from 'src/supabase-storage/supabase-storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Score]), SongsModule, UsersModule,
HttpModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    baseURL: configService.get<string>('HUGGING_FACE_WHISPER_URL') || 'https://hankhongg-manoke-whisper-server.hf.space/transcribe',
  }),
}), SupabaseStorageModule],
  controllers: [ScoresController],
  providers: [ScoresService],
  exports: [ScoresService], //export the service so it can be used in other modules
})
export class ScoresModule {}
