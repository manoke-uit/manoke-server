import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { YoutubeSearchResponseDto } from 'external-apis/dto/youtube-response.dto';
export declare class YoutubeApiService {
    private httpService;
    private configService;
    constructor(httpService: HttpService, configService: ConfigService);
    searchVideos(query: string, maxResults?: number, pageToken?: string): Promise<YoutubeSearchResponseDto>;
}
