import { Module } from '@nestjs/common';
import { GeniusApiService } from './genius-api.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports:[HttpModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService) => ({
      baseURL: configService.get('GENIUS_BASE_URL') || 'https://api.genius.com',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${configService.get('GENIUS_ACCESS_TOKEN')}`,
      },
    }),
  })],
  providers: [GeniusApiService],
  exports: [GeniusApiService],
})
export class GeniusApiModule {}
