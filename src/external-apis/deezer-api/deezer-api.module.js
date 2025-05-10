"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeezerApiModule = void 0;
const common_1 = require("@nestjs/common");
const deezer_api_service_1 = require("./deezer-api.service");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
let DeezerApiModule = class DeezerApiModule {
};
exports.DeezerApiModule = DeezerApiModule;
exports.DeezerApiModule = DeezerApiModule = __decorate([
    (0, common_1.Module)({
        imports: [axios_1.HttpModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    baseURL: configService.get('DEEZER_BASE_URL') || 'https://api.deezer.com',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            })],
        exports: [deezer_api_service_1.DeezerApiService],
        providers: [deezer_api_service_1.DeezerApiService]
    })
], DeezerApiModule);
//# sourceMappingURL=deezer-api.module.js.map