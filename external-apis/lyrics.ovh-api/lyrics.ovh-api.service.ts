import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LyricsOvhApiService {
    constructor(private configService: ConfigService) {}
    private logger = new Logger(LyricsOvhApiService.name);
    async getLyrics(songTitle: string, artistName: string): Promise<string> {
        const baseUrl = this.configService.get<string>('LYRIC.OVH_BASE_URL') || 'https://api.lyrics.ovh/v1';
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
        } catch (error) {
            console.error('Error fetching lyrics:', error);
            throw error;
        }
    }
}
