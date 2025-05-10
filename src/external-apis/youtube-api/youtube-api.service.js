"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeApiService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let YoutubeApiService = class YoutubeApiService {
    httpService;
    configService;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
    }
    async searchVideos(query, maxResults = 5, pageToken) {
        const apiKey = this.configService.get('YOUTUBE_API_KEY');
        const baseUrl = this.configService.get('YOUTUBE_BASE_URL') || 'https://www.googleapis.com/youtube/v3';
        try {
            const searchResponse = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${baseUrl}/search`, {
                params: {
                    part: 'snippet',
                    q: `${query} karaoke`,
                    maxResults,
                    key: apiKey,
                    type: 'video',
                    ...(pageToken && { pageToken }),
                }
            }));
            const searchData = searchResponse.data;
            const videoIds = searchData.items.map(item => item.id.videoId).join(',');
            if (!videoIds) {
                return {
                    nextPageToken: searchData.nextPageToken || null,
                    prevPageToken: searchData.prevPageToken || null,
                    results: [],
                };
            }
            const videosResponse = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${baseUrl}/videos`, {
                params: {
                    part: 'snippet,status',
                    id: videoIds,
                    key: apiKey,
                }
            }));
            const videos = videosResponse.data.items;
            const results = videos
                .filter(video => video.status.embeddable &&
                ["Karaoke", "karaoke", "KARAOKE"].some(keyword => video.snippet.title.includes(keyword)))
                .map(video => ({
                videoId: video.id,
                title: video.snippet.title,
                isEmbedded: video.status?.embeddable,
                embedUrl: `https://www.youtube.com/embed/${video.id}`,
                thumbnailUrl: video.snippet.thumbnails.default.url,
            }));
            return {
                nextPageToken: searchData.nextPageToken || null,
                prevPageToken: searchData.prevPageToken || null,
                results,
            };
        }
        catch (e) {
            console.error('Error fetching YouTube videos:', e);
            throw new Error('Failed to fetch YouTube videos');
        }
    }
};
exports.YoutubeApiService = YoutubeApiService;
exports.YoutubeApiService = YoutubeApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService, config_1.ConfigService])
], YoutubeApiService);
//# sourceMappingURL=youtube-api.service.js.map