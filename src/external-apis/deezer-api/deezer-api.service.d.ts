import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class DeezerApiService {
    private readonly httpService;
    private readonly configService;
    constructor(httpService: HttpService, configService: ConfigService);
    isDeezerPreviewValid(previewUrl: string): Promise<boolean>;
    getDeezerPreviewUrl(songTitle: string, artistName: string): Promise<any>;
    downloadDeezerPreview(deezerPreviewUrl: string): Promise<string>;
}
