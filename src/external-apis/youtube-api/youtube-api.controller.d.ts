import { YoutubeApiService } from './youtube-api.service';
import { YoutubeSearchResponseDto } from 'external-apis/dto/youtube-response.dto';
export declare class YoutubeApiController {
    private youtubeApiService;
    constructor(youtubeApiService: YoutubeApiService);
    searchVideos(query: string, pageToken?: string): Promise<YoutubeSearchResponseDto>;
}
