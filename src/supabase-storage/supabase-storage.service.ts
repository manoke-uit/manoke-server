import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';

@Injectable()
export class SupabaseStorageService {
    private supabase: SupabaseClient;
    private readonly snippetBucketName: string = process.env.SUPABASE_SNIPPET_BUCKET || 'snippets';
    private readonly recordingBucketName: string = process.env.SUPABASE_RECORDING_BUCKET || 'recordings';
    private readonly videoBucketName: string = process.env.SUPABASE_VIDEO_BUCKET || 'videos';
    private readonly songsImagesBucketName: string = process.env.SUPABASE_SONGS_IMAGES_BUCKET || 'songs-images';
    private readonly avatarsBucketName: string = process.env.SUPABASE_PROFILE_AVATAR_BUCKET || 'avatars';
    private readonly artistsImagesBucketName: string = process.env.SUPABASE_ARTISTS_IMAGES_BUCKET || 'artists-images';
    private readonly playlistsImagesBucketName: string = process.env.SUPABASE_PLAYLISTS_IMAGES_BUCKET || 'playlists-images';

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL') ?? "";
        const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY') ?? "";
        this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }

    // upload snippet to Supabase Storage
    async uploadSnippetFromBuffer(buffer: Buffer, fileName: string): Promise<string | null> {
        const { data, error } = await this.supabase.storage
            .from(this.snippetBucketName)
            .upload(fileName, buffer, {
                contentType: 'audio/mpeg',
                upsert: true, // Overwrite if file already exists
            });

        if (error) {
            console.error('Upload failed:', error.message);
             return null;
        }

        const { data: publicUrlData } = this.supabase.storage.from(this.snippetBucketName).getPublicUrl(fileName);

        return publicUrlData?.publicUrl || '';
    }

    async uploadSnippetFromFile(filePath: string, fileName: string): Promise<string | null> {
        const buffer = fs.readFileSync(filePath);
        fs.unlinkSync(filePath); // or use fs.promises.unlink(tempPath)
        return await this.uploadSnippetFromBuffer(buffer, fileName);
    }

    // upload recordings to Supabase Storage
    async uploadRecordingFromBuffer(buffer: Buffer, fileName: string): Promise<string | null> {
        const { data, error } = await this.supabase.storage
            .from(this.recordingBucketName)
            .upload(fileName, buffer, {
                contentType: 'audio/mpeg',
                upsert: true, // Overwrite if file already exists
            });

        if (error) {
            console.error('Upload failed:', error.message);
             return null;
        }

        const { data: publicUrlData } = this.supabase.storage.from(this.recordingBucketName).getPublicUrl(fileName);

        return publicUrlData?.publicUrl || '';
    }

    async uploadRecordingFromFile(filePath: string, fileName: string): Promise<string | null> {
        const buffer = fs.readFileSync(filePath);
        fs.unlinkSync(filePath); // or use fs.promises.unlink(tempPath)
        return await this.uploadRecordingFromBuffer(buffer, fileName);
    }


    // upload videos to Supabase Storage
    async uploadVideoFromBuffer(buffer: Buffer, fileName: string): Promise<string | null> {
        const { data, error } = await this.supabase.storage
            .from(this.videoBucketName)
            .upload(fileName, buffer, {
                contentType: 'video/mp4',
                upsert: true, // Overwrite if file already exists
            });

        if (error) {
            console.error('Upload failed:', error.message);
             return null;
        }

        const { data: publicUrlData } = this.supabase.storage.from(this.videoBucketName).getPublicUrl(fileName);

        return publicUrlData?.publicUrl || '';
    }

    async uploadVideoFromFile(filePath: string, fileName: string): Promise<string | null> {
        const buffer = fs.readFileSync(filePath);
        fs.unlinkSync(filePath); // or use fs.promises.unlink(tempPath)
        return await this.uploadVideoFromBuffer(buffer, fileName);
    }

    // upload song images to Supabase Storage
    async uploadSongImageFromBuffer(buffer: Buffer, fileName: string): Promise<string | null> {
        const ext = fileName.split('.').pop();
        let contentType = 'image/png'; // default fallback

        switch (ext?.toLowerCase()) {
        case 'jpg':
        case 'jpeg':
            contentType = 'image/jpeg';
            break;
        case 'png':
            contentType = 'image/png';
            break;
        case 'webp':
            contentType = 'image/webp';
            break;
        case 'gif':
            contentType = 'image/gif';
            break;
        }

        const { data, error } = await this.supabase.storage
            .from(this.songsImagesBucketName)
            .upload(fileName, buffer, {
                contentType: contentType,
                upsert: true, // Overwrite if file already exists
            });

        if (error) {
            console.error('Upload failed:', error.message);
             return null;
        }

        const { data: publicUrlData } = this.supabase.storage.from(this.songsImagesBucketName).getPublicUrl(fileName);

        return publicUrlData?.publicUrl || '';
    }

    async uploadSongImageFromFile(filePath: string, fileName: string): Promise<string | null> {
        const buffer = fs.readFileSync(filePath);
        fs.unlinkSync(filePath); // or use fs.promises.unlink(tempPath)
        return await this.uploadSongImageFromBuffer(buffer, fileName);
    }
    // upload profile images to Supabase Storage

    async uploadAvatarFromBuffer(buffer: Buffer, fileName: string): Promise<string | null> {
        const ext = fileName.split('.').pop();
        let contentType = 'image/png'; // default fallback

        switch (ext?.toLowerCase()) {
        case 'jpg':
        case 'jpeg':
            contentType = 'image/jpeg';
            break;
        case 'png':
            contentType = 'image/png';
            break;
        case 'webp':
            contentType = 'image/webp';
            break;
        case 'gif':
            contentType = 'image/gif';
            break;
        }

        const { data, error } = await this.supabase.storage
            .from(this.avatarsBucketName)
            .upload(fileName, buffer, {
                contentType: contentType,
                upsert: true, // Overwrite if file already exists
            });

        if (error) {
            console.error('Upload failed:', error.message);
             return null;
        }

        const { data: publicUrlData } = this.supabase.storage.from(this.avatarsBucketName).getPublicUrl(fileName);

        return publicUrlData?.publicUrl || '';
    }

    async uploadAvatarFromFile(filePath: string, fileName: string): Promise<string | null> {
        const buffer = fs.readFileSync(filePath);
        fs.unlinkSync(filePath); // or use fs.promises.unlink(tempPath)
        return await this.uploadAvatarFromBuffer(buffer, fileName);
    }
    // upload artists images to Supabase Storage
     async uploadArtistsImagesFromBuffer(buffer: Buffer, fileName: string): Promise<string | null> {
        const ext = fileName.split('.').pop();
        let contentType = 'image/png'; // default fallback

        switch (ext?.toLowerCase()) {
        case 'jpg':
        case 'jpeg':
            contentType = 'image/jpeg';
            break;
        case 'png':
            contentType = 'image/png';
            break;
        case 'webp':
            contentType = 'image/webp';
            break;
        case 'gif':
            contentType = 'image/gif';
            break;
        }

        const { data, error } = await this.supabase.storage
            .from(this.artistsImagesBucketName)
            .upload(fileName, buffer, {
                contentType: contentType,
                upsert: true, // Overwrite if file already exists
            });

        if (error) {
            console.error('Upload failed:', error.message);
             return null;
        }

        const { data: publicUrlData } = this.supabase.storage.from(this.artistsImagesBucketName).getPublicUrl(fileName);

        return publicUrlData?.publicUrl || '';
    }

    async uploadArtistsImagesFromFile(filePath: string, fileName: string): Promise<string | null> {
        const buffer = fs.readFileSync(filePath);
        fs.unlinkSync(filePath); // or use fs.promises.unlink(tempPath)
        return await this.uploadArtistsImagesFromBuffer(buffer, fileName);
    }
    // upload artists images to Supabase Storage
     async uploadPlaylistsImagesFromBuffer(buffer: Buffer, fileName: string): Promise<string | null> {
        const ext = fileName.split('.').pop();
        let contentType = 'image/png'; // default fallback

        switch (ext?.toLowerCase()) {
        case 'jpg':
        case 'jpeg':
            contentType = 'image/jpeg';
            break;
        case 'png':
            contentType = 'image/png';
            break;
        case 'webp':
            contentType = 'image/webp';
            break;
        case 'gif':
            contentType = 'image/gif';
            break;
        }

        const { data, error } = await this.supabase.storage
            .from(this.playlistsImagesBucketName)
            .upload(fileName, buffer, {
                contentType: contentType,
                upsert: true, // Overwrite if file already exists
            });

        if (error) {
            console.error('Upload failed:', error.message);
             return null;
        }

        const { data: publicUrlData } = this.supabase.storage.from(this.playlistsImagesBucketName).getPublicUrl(fileName);

        return publicUrlData?.publicUrl || '';
    }

    async uploadPlaylistsImagesFromFile(filePath: string, fileName: string): Promise<string | null> {
        const buffer = fs.readFileSync(filePath);
        fs.unlinkSync(filePath); // or use fs.promises.unlink(tempPath)
        return await this.uploadPlaylistsImagesFromBuffer(buffer, fileName);
    }
}
