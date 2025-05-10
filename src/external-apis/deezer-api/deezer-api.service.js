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
exports.DeezerApiService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
const path = require("path");
const rxjs_1 = require("rxjs");
const fs = require("fs");
const axios_2 = require("axios");
let DeezerApiService = class DeezerApiService {
    httpService;
    configService;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
    }
    async isDeezerPreviewValid(previewUrl) {
        try {
            const res$ = this.httpService.head(previewUrl);
            const res = await (0, rxjs_1.lastValueFrom)(res$);
            return res.status === 200;
        }
        catch (e) {
            console.error('Error checking Deezer preview URL:', e?.response?.data || e.message || e);
            return false;
        }
    }
    async getDeezerPreviewUrl(songTitle, artistName) {
        const query = `track:"${songTitle}" artist:"${artistName}"`;
        const url = `${this.configService.get("DEEZER_BASE_URL")}/search?q=${encodeURIComponent(query)}`;
        console.log("deezer url: ", url);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
            const firstTrack = response.data?.data?.[0];
            if (!firstTrack || !firstTrack.preview) {
                console.error('No preview URL found in Deezer response:', response.data);
                return null;
            }
            return firstTrack;
        }
        catch (e) {
            console.error('Error fetching Deezer preview URL:', e?.response?.data || e.message || e);
            throw new Error('Failed to fetch Deezer preview URL');
        }
    }
    async downloadDeezerPreview(deezerPreviewUrl) {
        const tempDir = path.join(__dirname, '..', '..', 'temp');
        if (!fs.existsSync(tempDir))
            fs.mkdirSync(tempDir, { recursive: true });
        const tempPath = path.join(tempDir, `${(0, uuid_1.v4)()}.mp3`);
        const response = await axios_2.default.get(deezerPreviewUrl, {
            responseType: 'stream',
        });
        const writer = fs.createWriteStream(tempPath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                resolve(tempPath);
            });
            writer.on('error', (err) => {
                reject(err);
            });
        });
    }
};
exports.DeezerApiService = DeezerApiService;
exports.DeezerApiService = DeezerApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], DeezerApiService);
//# sourceMappingURL=deezer-api.service.js.map