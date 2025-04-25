import { HttpService } from '@nestjs/axios';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeezerApiService } from 'external-apis/deezer-api/deezer-api.service';
import { LyricsOvhApiService } from 'external-apis/lyrics.ovh-api/lyrics.ovh-api.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { ArtistsService } from 'src/artists/artists.service';
import { Song } from 'src/songs/entities/song.entity';
import { SongsService } from 'src/songs/songs.service';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';

@Injectable()
export class SpotifyApiService {
    constructor(private httpService : HttpService, private configService : ConfigService,
        @Inject(forwardRef(() => SongsService)) // avoid circular dependency
        private songsService : SongsService, 
        private artistsService : ArtistsService,
        private lyricsOvhApiService : LyricsOvhApiService,
        private deezerApiService : DeezerApiService,
        private supabaseStorageService : SupabaseStorageService,
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
                        limit: 5,
                    }
                }
            )
        )
        if (!response || !response.data || !response.data.tracks || !response.data.tracks.items) {
            console.error('Error fetching Spotify search results:', response?.data || 'No data returned');
            throw new Error('Failed to fetch Spotify search results');
        }
        
        return Promise.all(response.data.tracks.items.map(async track => {
            const audioDeezer = await this.deezerApiService.getDeezerPreviewUrl(query, track.artists[0].name);

            const safeName = track.name.replace(/[^a-zA-Z0-9]/gi, '_').toLowerCase(); // replace special characters with _

            let tempPath = "";
            let supabaseAudioUrl = "";
            if (!audioDeezer?.preview) {
                console.warn(`No Deezer preview for ${safeName}`);   
            }
            else {
                tempPath = await this.deezerApiService.downloadDeezerPreview(audioDeezer?.preview || "");
                supabaseAudioUrl = (await this.supabaseStorageService.uploadAudioFromFile(tempPath, safeName)) || "";
            }
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
            //console.log("track name" , track.name);
            //const geniusLyrics = await this.geniusApiService.getSongLyrics(query, track.artists[0].name);
            const ovhLyrics = await this.lyricsOvhApiService.getLyrics(track.name, track.artists[0].name);
            //console.log("ovhLyrics: ", ovhLyrics);
            return await this.songsService.create({
                title: track.name,
                albumTitle: track.album.name,
                imageUrl: track.album.images[0]?.url || null,
                releasedDate: track.album.release_date
                ? track.album.release_date.length === 4
                  ? `${track.album.release_date}-01-01` // still need to check if the date is valid
                  : track.album.release_date
                : "",
                duration: track.duration_ms,
                youtubeUrl: "", // update it later bc gonna search via youtube anyway !
                audioUrl: supabaseAudioUrl|| "",
                artistIds: artist.map(artist => artist.id),
                playlistIds: [],
                lyrics: ovhLyrics || "", // add lyrics via genius api later
                
            })
        }));


        
    }

    // TODO: get the query from youtube url
    async searchSongsWithYoutube(youtubeUrl: string) : Promise<Song[]>{
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
                        q: "some youtube title", // TODO: get the query from youtube url
                        type: 'track',
                        limit: 5,
                    }
                }
            )
        )
        if (!response || !response.data || !response.data.tracks || !response.data.tracks.items) {
            console.error('Error fetching Spotify search results:', response?.data || 'No data returned');
            throw new Error('Failed to fetch Spotify search results');
        }
        
        return Promise.all(response.data.tracks.items.map(async track => {
            
            const audioDeezer = await this.deezerApiService.getDeezerPreviewUrl("some youtube title", track.artists[0].name);  // TODO: get the query from youtube url
            const artist = await Promise.all(track.artists.map(async artist => {
                const foundArtist = await this.artistsService.findOneBySpotifyId(artist.id);
                if(foundArtist) return foundArtist;
                const newArtist = this.artistsService.create({
                    name: artist.name,
                    imageUrl: Array.isArray(artist.images) ? artist.images[0]?.url || null : null,
                    spotifyId: artist.id,
                    popularity: artist.popularity,
                    songIds: [], // update it later
                });
                console.log("artist: ", newArtist);
                return newArtist;
            }));
            if (audioDeezer) {
                console.log(`deezer title: ${audioDeezer.title}\naudio: ${audioDeezer.preview}`);
            } else {
                console.warn(`No matching Deezer result for: ${track.name}`);
            }
            //console.log("track name" , track.name);
            //const geniusLyrics = await this.geniusApiService.getSongLyrics(query, track.artists[0].name);
            const ovhLyrics = await this.lyricsOvhApiService.getLyrics(track.name, track.artists[0].name);
            //console.log("ovhLyrics: ", ovhLyrics);
            return await this.songsService.create({
                title: track.name,
                albumTitle: track.album.name,
                imageUrl: track.album.images[0]?.url || null,
                releasedDate: track.album.release_date
                ? track.album.release_date.length === 4
                  ? `${track.album.release_date}-01-01` // still need to check if the date is valid
                  : track.album.release_date
                : "",
                duration: track.duration_ms,
                youtubeUrl: youtubeUrl,
                audioUrl: track.preview_url || audioDeezer?.preview || "",
                artistIds: artist.map(artist => artist.id),
                playlistIds: [],
                lyrics: ovhLyrics || "", // add lyrics via genius api later
                
            })
        }));


        
    }
}