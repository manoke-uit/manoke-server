import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, lastValueFrom } from 'rxjs';

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
}
