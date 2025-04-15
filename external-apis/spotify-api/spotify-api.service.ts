import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SpotifyApiService {
    constructor(private httpService : HttpService, private configService : ConfigService){}
    // implemnt getToken
    private token = null;
    private expireTime = 0;

    async getToken(): Promise<string> {
        // if token still accessible
        if(this.token && this.expireTime - (Date.now() / 1000) > 0){
            return this.token;
        }
        // else => get a new token
        const clientId = this.configService.get<string>('SPOTIFY_CLIENT_ID');
        const clientSecret = this.configService.get<string>('SPOTIFY_CLIENT_SECRET');
        const clientCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const url = 'https://accounts.spotify.com/api/token';
        const data = 'grant_type=client_credentials'
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${clientCredentials}`,
        }

        const response = await firstValueFrom(
            this.httpService.post(
                url,
                data,
                {headers}
            )
        );
        this.token = response.data.access_token;
        this.expireTime = response.data.expires_in + (Date.now() / 1000); // set the expire time
        if (!this.token) {
            throw new Error('Failed to retrieve Spotify access token');
        }
        return this.token;
    }
}
