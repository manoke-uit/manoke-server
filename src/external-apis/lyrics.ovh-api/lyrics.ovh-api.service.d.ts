import { ConfigService } from '@nestjs/config';
export declare class LyricsOvhApiService {
    private configService;
    constructor(configService: ConfigService);
    private logger;
    getLyrics(songTitle: string, artistName: string): Promise<string>;
}
