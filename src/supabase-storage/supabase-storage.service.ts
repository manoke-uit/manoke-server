import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';

@Injectable()
export class SupabaseStorageService {
    private supabase: SupabaseClient;
    private readonly bucketName: string = process.env.SUPABASE_BUCKET_NAME || 'snippets';

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL') ?? "";
        const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY') ?? "";
        this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }

    async uploadAudioFromBuffer(buffer: Buffer, fileName: string): Promise<string | null> {
        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .upload(fileName, buffer, {
                contentType: 'audio/mpeg',
                upsert: true, // Overwrite if file already exists
            });

        if (error) {
            console.error('Upload failed:', error.message);
             return null;
        }

        const { data: publicUrlData } = this.supabase.storage.from(this.bucketName).getPublicUrl(fileName);

        return publicUrlData?.publicUrl || '';
    }

    async uploadAudioFromFile(filePath: string, fileName: string): Promise<string | null> {
        const buffer = fs.readFileSync(filePath);
        fs.unlinkSync(filePath); // or use fs.promises.unlink(tempPath)
        return await this.uploadAudioFromBuffer(buffer, fileName);
    }

}
