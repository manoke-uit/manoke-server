import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI  from 'openai';
import * as fs from 'fs';
import { toFile } from 'openai/uploads';

@Injectable()
export class WhisperApiService {
    private openai: OpenAI;

    constructor(private configService : ConfigService) {
        // initialize OpenAI with the base URL and API key from the config service
        const apiKey = this.configService.get<string>('WHISPER_API_KEY');
    if (!apiKey) {
      throw new Error('WHISPER_API_KEY is not set in the environment variables');
    }

    this.openai = new OpenAI({
      apiKey,
      timeout: 30000, // ✅ Optional: handle slow networks
      // no need for baseURL unless you're overriding it
    });
    }

    async transcribeAudio(filePath: string): Promise<string> {
        try {
            const file = await toFile(fs.createReadStream(filePath), 'audio.mp3');
            const response = await this.openai.audio.transcriptions.create({
                file,
                model: 'whisper-1',
                response_format: 'text',
            });
            return response || '';
        } catch (error) {
            console.error('Error transcribing audio:', error);
            throw error;
        }
    }
}
