import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { YoutubeSearchResponseDto } from 'external-apis/dto/youtube-response.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class YoutubeApiService {
    constructor(private httpService: HttpService, private configService: ConfigService) {}
    async searchVideos(query: string, maxResults: number = 5, pageToken?: string): Promise<YoutubeSearchResponseDto> {
        const apiKey = this.configService.get<string>('YOUTUBE_API_KEY');
        const url = `${this.configService.get<string>('YOUTUBE_BASE_URL')}/search` || 'https://www.googleapis.com/youtube/v3/search';
        try {
            const response = await lastValueFrom(
                this.httpService.get(
                    url,
                    {
                        params: {
                            part: 'snippet',
                            q: query + " karaoke",
                            maxResults: maxResults,
                            key: apiKey,
                            type: 'video',
                            ...(pageToken && {pageToken}), // only add pageToken if it exists
                        }
                    }
                )
            );
            const data = response.data;
            console.log('Youtube API response:', data);
            return {
                nextPageToken: data.nextPageToken || null,
                prevPageToken: data.prevPageToken || null,
                results: data.items.map((item) => ({
                    videoId: item.id.videoId,
                    title: item.snippet.title,
                    embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
                    thumbnailUrl: item.snippet.thumbnails.default.url,
                    //duration: item.snippet.
                }))
            };
        }
        catch(e){
            console.error('Error fetching Youtube videos:', e);
            throw new Error('Failed to fetch Youtube videos');
        }
    }
}
