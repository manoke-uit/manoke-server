import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

@Injectable()
export class GeniusApiService {
    constructor(private configService : ConfigService, private httpService: HttpService){}
    private readonly logger = new Logger(GeniusApiService.name);

    async searchSongGenius(songTitle: string, artistName: string): Promise<string | null> {
        const url = `${this.configService.get<string>('GENIUS_BASE_URL')}/search`;
        const query = `track:"${songTitle}" artist:"${artistName}"`;
        const token = this.configService.get<string>('GENIUS_ACCESS_TOKEN')
        try {
            const response = await firstValueFrom(
                this.httpService.get(
                    url,
                    {
                        params: { q: query },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                ).pipe(
                    catchError((err) => {
                        this.logger.error('Error fetching song lyrics:', err?.response?.data || err.message || err);
                        throw new Error('Failed to fetch song lyrics');
                    })
                )
            );
            const hits = response.data?.response?.hits;
            if (!hits || hits.length === 0) {
                this.logger.warn('No hits found in Genius API response:', response.data);
                return null;
            }
            return hits[0].result?.url; // Assuming the lyrics are in the URL of the first hit
        } catch(e){
            this.logger.error('Error fetching song lyrics:', e?.response?.data || e.message || e);
            throw new Error('Failed to fetch song lyrics');
        }
    }

    async getSongLyrics(songTitle: string, artistName: string): Promise<string | null> {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          };
        const url = await this.searchSongGenius(songTitle, artistName);
        if (!url) {
            this.logger.warn('No URL found for song lyrics');
            return null;
        }
        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);
        //const lyrics = $('.lyrics').text().trim() || $('.Lyrics__Container-sc-1ynbvzw-0').text().trim();
        const lyrics = $('div.lyrics').text().trim();
        return lyrics;
    }
}
