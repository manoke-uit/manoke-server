import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { WhisperApiService } from './whisper-api.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('whisper-api')
export class WhisperApiController {
    constructor(private whisperApiService : WhisperApiService) {}

    @Post('transcribe')
    @UseInterceptors(FileInterceptor('file'))
    async transcribe(@UploadedFile() file: Express.Multer.File): Promise<string> {
        try {
            const tempDir = path.join(__dirname, '..', '..', 'temp');
            if (!fs.existsSync(tempDir)) {
              fs.mkdirSync(tempDir, { recursive: true }); // ✅ ensure folder exists
            }

            const tempFilePath = path.join(tempDir, file.originalname);
            fs.writeFileSync(tempFilePath, file.buffer); // save the file temporarily

            const transcription = await this.whisperApiService.transcribeAudio(tempFilePath);
            fs.unlinkSync(tempFilePath); // clean up the temporary file
            return transcription;
        } catch (error) {
            console.error('Error transcribing audio:', error);
            throw error;
        }
    }
}
