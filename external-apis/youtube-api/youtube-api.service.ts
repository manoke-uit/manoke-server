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
        const baseUrl = this.configService.get<string>('YOUTUBE_BASE_URL') || 'https://www.googleapis.com/youtube/v3';
    
        try {
            // Step 1: Search
            const searchResponse = await lastValueFrom(
                this.httpService.get(`${baseUrl}/search`, {
                    params: {
                        part: 'snippet',
                        q: `${query} karaoke`,
                        maxResults,
                        key: apiKey,
                        type: 'video',
                        ...(pageToken && { pageToken }),
                    }
                })
            );
    
            const searchData = searchResponse.data;
            const videoIds = searchData.items.map(item => item.id.videoId).join(',');
    
            if (!videoIds) {
                return {
                    nextPageToken: searchData.nextPageToken || null,
                    prevPageToken: searchData.prevPageToken || null,
                    results: [],
                };
            }
    
            // Step 2: Fetch video details
            const videosResponse = await lastValueFrom(
                this.httpService.get(`${baseUrl}/videos`, {
                    params: {
                        part: 'snippet,status',
                        id: videoIds,
                        key: apiKey,
                    }
                })
            );
    
            const videos = videosResponse.data.items;
    
            const results = videos
                .filter(
                    video => 
                        video.status.embeddable &&
                    ["Karaoke", "karaoke", "KARAOKE"].some(keyword => video.snippet.title.includes(keyword))
                )
                .map(video => ({
                    videoId: video.id,
                    title: video.snippet.title,
                    isEmbedded: video.status?.embeddable,
                    embedUrl: `https://www.youtube.com/embed/${video.id}`,
                    thumbnailUrl: video.snippet.thumbnails.default.url,
                    //duration: video.snippet.
                }));
    
            return {
                nextPageToken: searchData.nextPageToken || null,
                prevPageToken: searchData.prevPageToken || null,
                results,
            };
    
        } catch (e) {
            console.error('Error fetching YouTube videos:', e);
            throw new Error('Failed to fetch YouTube videos');
        }
    }
    
}
