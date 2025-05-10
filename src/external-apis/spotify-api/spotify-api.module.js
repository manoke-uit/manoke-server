"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyApiModule = void 0;
const common_1 = require("@nestjs/common");
const spotify_api_service_1 = require("./spotify-api.service");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const songs_module_1 = require("../../src/songs/songs.module");
const artists_module_1 = require("../../src/artists/artists.module");
const lyrics_ovh_api_module_1 = require("../lyrics.ovh-api/lyrics.ovh-api.module");
const deezer_api_module_1 = require("../deezer-api/deezer-api.module");
const supabase_storage_module_1 = require("../../src/supabase-storage/supabase-storage.module");
let SpotifyApiModule = class SpotifyApiModule {
};
exports.SpotifyApiModule = SpotifyApiModule;
exports.SpotifyApiModule = SpotifyApiModule = __decorate([
    (0, common_1.Module)({
        providers: [spotify_api_service_1.SpotifyApiService],
        imports: [
            axios_1.HttpModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    baseURL: configService.get('SPOTIFY_BASE_URL') || 'https://api.spotify.com/v1',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }),
            }),
            (0, common_1.forwardRef)(() => songs_module_1.SongsModule),
            artists_module_1.ArtistsModule,
            lyrics_ovh_api_module_1.LyricsOvhApiModule,
            deezer_api_module_1.DeezerApiModule,
            supabase_storage_module_1.SupabaseStorageModule
        ],
        exports: [spotify_api_service_1.SpotifyApiService],
    })
], SpotifyApiModule);
//# sourceMappingURL=spotify-api.module.js.map