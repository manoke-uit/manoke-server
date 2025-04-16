import { HttpService } from '@nestjs/axios';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeniusApiService } from 'external-apis/genius-api/genius-api.service';
import { firstValueFrom } from 'rxjs';
import { ArtistsService } from 'src/artists/artists.service';
import { Song } from 'src/songs/entities/song.entity';
import { SongsService } from 'src/songs/songs.service';

@Injectable()
export class SpotifyApiService {
    constructor(private httpService : HttpService, private configService : ConfigService,
        @Inject(forwardRef(() => SongsService)) // avoid circular dependency
        private songsService : SongsService, 
        private artistsService : ArtistsService,
        private geniusApiService : GeniusApiService,
    ){}
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
        const baseUrl = 'https://accounts.spotify.com/api/token';
        const data = 'grant_type=client_credentials'
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${clientCredentials}`,
        }
        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    baseUrl,
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
        catch(e){
            console.error('Error fetching Spotify token:', e?.response?.data || e.message || e);
            throw new Error('Failed to fetch Spotify token');
        }
        
    }

    async getDeezerPreviewUrl(songTitle: string, artistName: string) : Promise<any>{
        const query = `track:"${songTitle}" artist:"${artistName}"`;
        const url = `${this.configService.get<string>("DEEZER_BASE_URL")}/search?q=${encodeURIComponent(query)}`;
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

    async searchSongs(query: string) : Promise<Song[]>{
        const token = await this.getToken();
        const baseUrl = this.configService.get<string>('SPOTIFY_BASE_URL') || 'https://api.spotify.com/v1';
        const url = `${baseUrl}/search`;
        const response = await firstValueFrom(
            this.httpService.get(
                url,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                    params: {
                        q: query,
                        type: 'track',
                        limit: 10,
                    }
                }
            )
        )
        if (!response || !response.data || !response.data.tracks || !response.data.tracks.items) {
            console.error('Error fetching Spotify search results:', response?.data || 'No data returned');
            throw new Error('Failed to fetch Spotify search results');
        }
        
        return Promise.all(response.data.tracks.items.map(async track => {
            
            const audioDeezer = await this.getDeezerPreviewUrl(query, track.artists[0].name);
            const artist = await Promise.all(track.artists.map(async artist => {
                const foundArtist = await this.artistsService.findOneBySpotifyId(artist.id);
                if(foundArtist) return foundArtist;
                const newArtist = this.artistsService.create({
                    name: artist.name,
                    imageUrl: Array.isArray(artist.images) ? artist.images[0]?.url || null : null,
                    spotifyId: artist.id,
                    popularity: artist.popularity,
                    songIds: [],
                });
                console.log("artist: ", newArtist);
                return newArtist;
            }));
            if (audioDeezer) {
                console.log(`deezer title: ${audioDeezer.title}\naudio: ${audioDeezer.preview}`);
            } else {
                console.warn(`No matching Deezer result for: ${track.name}`);
            }
            console.log("track name" , track.name);
            const geniusLyrics = await this.geniusApiService.getSongLyrics(query, track.artists[0].name);
            return await this.songsService.create({
                title: track.name,
                albumTitle: track.album.name,
                imageUrl: track.album.images[0]?.url || null,
                releasedDate: track.album.release_date?.length === 4 ? `${track.album.release_date}-01-01` : track.album.release_date,
                duration: track.duration_ms,
                youtubeUrl: "", // update it later bc gonna search via youtube anyway !
                audioUrl: track.preview_url || audioDeezer?.preview || "",
                artistIds: artist.map(artist => artist.id),
                playlistIds: [],
                lyrics: geniusLyrics || "", // add lyrics via genius api later
                
            })
        }));
    }
}