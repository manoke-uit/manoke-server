"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeApiModule = void 0;
const common_1 = require("@nestjs/common");
const youtube_api_service_1 = require("./youtube-api.service");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const youtube_api_controller_1 = require("./youtube-api.controller");
let YoutubeApiModule = class YoutubeApiModule {
};
exports.YoutubeApiModule = YoutubeApiModule;
exports.YoutubeApiModule = YoutubeApiModule = __decorate([
    (0, common_1.Module)({
        providers: [youtube_api_service_1.YoutubeApiService],
        imports: [
            axios_1.HttpModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    baseURL: configService.get('YOUTUBE_BASE_URL') || 'https://www.googleapis.com/youtube/v3',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }),
            })
        ],
        exports: [youtube_api_service_1.YoutubeApiService],
        controllers: [youtube_api_controller_1.YoutubeApiController],
    })
], YoutubeApiModule);
//# sourceMappingURL=youtube-api.module.js.map