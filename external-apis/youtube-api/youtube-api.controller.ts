import { Controller, Get, Param, Query } from '@nestjs/common';
import { YoutubeApiService } from './youtube-api.service';
import { YoutubeSearchResponseDto } from 'external-apis/dto/youtube-response.dto';

@Controller('youtube')
export class YoutubeApiController {
    constructor(private youtubeApiService : YoutubeApiService) {}
    @Get('search')
    async searchVideos(@Query('q') query: string, @Query('pageToken') pageToken?: string,) : Promise<YoutubeSearchResponseDto> {
        return await this.youtubeApiService.searchVideos(query,5, pageToken);
    }
}
