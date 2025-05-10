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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyApiService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const deezer_api_service_1 = require("../deezer-api/deezer-api.service");
const lyrics_ovh_api_service_1 = require("../lyrics.ovh-api/lyrics.ovh-api.service");
const rxjs_1 = require("rxjs");
const artists_service_1 = require("../../src/artists/artists.service");
const songs_service_1 = require("../../src/songs/songs.service");
const supabase_storage_service_1 = require("../../src/supabase-storage/supabase-storage.service");
let SpotifyApiService = class SpotifyApiService {
    httpService;
    configService;
    songsService;
    artistsService;
    lyricsOvhApiService;
    deezerApiService;
    supabaseStorageService;
    constructor(httpService, configService, songsService, artistsService, lyricsOvhApiService, deezerApiService, supabaseStorageService) {
        this.httpService = httpService;
        this.configService = configService;
        this.songsService = songsService;
        this.artistsService = artistsService;
        this.lyricsOvhApiService = lyricsOvhApiService;
        this.deezerApiService = deezerApiService;
        this.supabaseStorageService = supabaseStorageService;
    }
    token = null;
    expireTime = 0;
    async getToken() {
        if (this.token && this.expireTime - (Date.now() / 1000) > 0) {
            return this.token;
        }
        const clientId = this.configService.get('SPOTIFY_CLIENT_ID');
        const clientSecret = this.configService.get('SPOTIFY_CLIENT_SECRET');
        const clientCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const baseUrl = 'https://accounts.spotify.com/api/token';
        const data = 'grant_type=client_credentials';
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${clientCredentials}`,
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(baseUrl, data, { headers }));
            this.token = response.data.access_token;
            this.expireTime = response.data.expires_in + (Date.now() / 1000);
            if (!this.token) {
                throw new Error('Failed to retrieve Spotify access token');
            }
            return this.token;
        }
        catch (e) {
            console.error('Error fetching Spotify token:', e?.response?.data || e.message || e);
            throw new Error('Failed to fetch Spotify token');
        }
    }
    async queryFilter(trackName, query) {
        const trackWords = trackName.toLowerCase().split(' ');
        const queryWords = query.toLowerCase().split(' ');
        console.log(trackName);
        console.log(query);
        return trackWords.every(trackWord => queryWords.includes(trackWord));
    }
};
exports.SpotifyApiService = SpotifyApiService;
exports.SpotifyApiService = SpotifyApiService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => songs_service_1.SongsService))),
    __metadata("design:paramtypes", [axios_1.HttpService, config_1.ConfigService,
        songs_service_1.SongsService,
        artists_service_1.ArtistsService,
        lyrics_ovh_api_service_1.LyricsOvhApiService,
        deezer_api_service_1.DeezerApiService,
        supabase_storage_service_1.SupabaseStorageService])
], SpotifyApiService);
//# sourceMappingURL=spotify-api.service.js.map