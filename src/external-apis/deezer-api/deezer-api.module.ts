import { Module } from '@nestjs/common';
import { DeezerApiService } from './deezer-api.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      baseURL: configService.get<string>('DEEZER_BASE_URL') || 'https://api.deezer.com',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })],
  exports: [DeezerApiService],
  providers: [DeezerApiService]
})
export class DeezerApiModule {}
