import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import * as fs from 'fs';
import axios from 'axios';

@Injectable()
export class DeezerApiService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    async isDeezerPreviewValid(previewUrl: string) : Promise<boolean> {
        try{
            const res$ = this.httpService.head(previewUrl);
            const res = await lastValueFrom(res$);
            return res.status === 200;
        } catch(e){
            console.error('Error checking Deezer preview URL:', e?.response?.data || e.message || e);
            return false;
        }
    }

    async getDeezerPreviewUrl(songTitle: string, artistName: string) : Promise<any>{
        const query = `track:"${songTitle}" artist:"${artistName}"`;
        const url = `${this.configService.get<string>("DEEZER_BASE_URL")}/search?q=${encodeURIComponent(query)}`;
        console.log("deezer url: ", url);
        try {
            const response = await firstValueFrom(this.httpService.get(url));
            const firstTrack = response.data?.data?.[0];
            if (!firstTrack || !firstTrack.preview) {
                console.error('No preview URL found in Deezer response:', response.data);
                return null;
            }
            return firstTrack;
        } catch(e){
            console.error('Error fetching Deezer preview URL:', e?.response?.data || e.message || e);
            throw new Error('Failed to fetch Deezer preview URL');
        }
        
    }

    async downloadDeezerPreview(deezerPreviewUrl: string) : Promise<string> {
        // make sure the temp directory exists
        const tempDir = path.join(__dirname, '..', '..', 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        const tempPath = path.join(tempDir, `${uuidv4()}.mp3`);
        const response = await axios.get(deezerPreviewUrl, {
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
}
