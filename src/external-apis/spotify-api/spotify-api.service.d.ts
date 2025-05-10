import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { DeezerApiService } from 'external-apis/deezer-api/deezer-api.service';
import { LyricsOvhApiService } from 'external-apis/lyrics.ovh-api/lyrics.ovh-api.service';
import { ArtistsService } from 'src/artists/artists.service';
import { SongsService } from 'src/songs/songs.service';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
export declare class SpotifyApiService {
    private httpService;
    private configService;
    private songsService;
    private artistsService;
    private lyricsOvhApiService;
    private deezerApiService;
    private supabaseStorageService;
    constructor(httpService: HttpService, configService: ConfigService, songsService: SongsService, artistsService: ArtistsService, lyricsOvhApiService: LyricsOvhApiService, deezerApiService: DeezerApiService, supabaseStorageService: SupabaseStorageService);
    private token;
    private expireTime;
    getToken(): Promise<string>;
    queryFilter(trackName: string, query: string): Promise<boolean>;
}
