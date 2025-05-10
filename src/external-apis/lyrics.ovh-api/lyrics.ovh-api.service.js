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
var LyricsOvhApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LyricsOvhApiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let LyricsOvhApiService = LyricsOvhApiService_1 = class LyricsOvhApiService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    logger = new common_1.Logger(LyricsOvhApiService_1.name);
    async getLyrics(songTitle, artistName) {
        const baseUrl = this.configService.get('LYRIC.OVH_BASE_URL') || 'https://api.lyrics.ovh/v1';
        const url = `${baseUrl}/${encodeURIComponent(artistName)}/${encodeURIComponent(songTitle)}`;
        console.log(`Fetching lyrics from: ${url}`);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                this.logger.error(`Error fetching lyrics: ${response.status} ${response.statusText}`);
                return "";
            }
            const data = await response.json();
            return data.lyrics || '';
        }
        catch (error) {
            console.error('Error fetching lyrics:', error);
            throw error;
        }
    }
};
exports.LyricsOvhApiService = LyricsOvhApiService;
exports.LyricsOvhApiService = LyricsOvhApiService = LyricsOvhApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LyricsOvhApiService);
//# sourceMappingURL=lyrics.ovh-api.service.js.map