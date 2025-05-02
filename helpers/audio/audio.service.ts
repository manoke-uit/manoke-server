import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFileSync, unlinkSync } from 'fs';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as axios from 'axios';
import { BasicPitchDto } from './dto/basic-pitch.dto';
import * as stringSimilarity from 'string-similarity';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

@Injectable()
export class AudioService {
    async splitAudioFile(buffer: Buffer, fileName: string, chunkDuration = 30): Promise<Buffer[]> {
        const tempInputPath = join(tmpdir(), `${Date.now()}-${fileName}`);
        const baseName = `${Date.now()}`;
        const outputPattern = join(tmpdir(), `${baseName}-chunk-%03d.mp3`);

        // Save the buffer to disk temporarily
        writeFileSync(tempInputPath, buffer);

        return new Promise((resolve, reject) => {
            ffmpeg(tempInputPath)
            .outputOptions([
                `-f segment`,
                `-segment_time ${chunkDuration}`,
                `-c copy`,
            ])
            .output(outputPattern)
            .on('end', () => {
                // Read all generated chunk files
                const chunkBuffers: Buffer[] = [];
                const baseDir = tmpdir();
                let index = 0;
                while (true) {
                const chunkPath = join(baseDir, `${baseName}-chunk-${String(index).padStart(3, '0')}.mp3`);
                if (!fs.existsSync(chunkPath)) break;
                chunkBuffers.push(fs.readFileSync(chunkPath));
                unlinkSync(chunkPath); // cleanup
                index++;
                }
                unlinkSync(tempInputPath); // remove input file
                resolve(chunkBuffers);
            })
            .on('error', (err) => {
                console.error('FFmpeg error:', err);
                reject(err);
            })
            .run();
        });
    }

    async fetchAudioBufferFromUrl(url: string): Promise<Buffer> {
        const response = await axios.default.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    }

    async compareOnePitch(userPitch: BasicPitchDto, chunkPitch: BasicPitchDto): Promise<number> {
        const userPitchValue = userPitch.pitch;
        const chunkPitchValue = chunkPitch.pitch;

        if (chunkPitchValue === 0) return 0; // avoid division by zero
        if (userPitchValue === 0) return 0;  // avoid scoring silent sections

        // 1. Pitch difference
        const pitchDifference = Math.abs(userPitchValue - chunkPitchValue);

        // 2. Pitch tolerance (you allow ±1 semitone "mistake")
        const pitchTolerance = 1;
        const normalizedDifference = Math.max(0, pitchDifference - pitchTolerance);

        // 3. Raw pitch score
        let pitchScore = 1 - (normalizedDifference / 12); 
        // 12 because 12 semitones = 1 octave, normalize over 12 instead of using chunkPitchValue
        // so even if user sings one octave wrong it's still considered "far"

        // 4. Compare confidence levels
        // get max of confidence levels OR similarity of the two pitches
        const confidenceDifference = Math.abs(userPitch.confidence - chunkPitch.confidence);
        const confidenceTolerance = 0.1; // 10% tolerance
        const normalizedConfidenceDifference = Math.max(0, confidenceDifference - confidenceTolerance);
        const confidenceScore = 1 - (normalizedConfidenceDifference / 1); // normalize over 1 (0-1 range)

        const maxConfidenceScore = Math.max(confidenceScore, userPitch.confidence)

        // const averageConfidence = (userPitch.confidence + chunkPitch.confidence) / 2;
        // pitchScore *= averageConfidence;
        // 5. Combine scores
        const pitchConfidenceScore = (pitchScore + maxConfidenceScore) / 2; // average of pitch score and confidence score
        // 6. Normalize to 0-1 range
        return Math.max(0, Math.min(1, pitchConfidenceScore));
    }

    async compareLyrics(userLyrics: string, chunkLyrics: string): Promise<number> {
        const normalize = (text: string): string =>
            text.replace(/\r?\n|\r/g, ' ')   // Replace all newlines with space
                .replace(/\s+/g, ' ')        // Collapse extra spaces
                .replace(/[.?,!]/g, '')
                .trim()
                .toLowerCase();
        const normalizedUserLyrics = normalize(userLyrics);
        const normalizedChunkLyrics = normalize(chunkLyrics);
        const similarity = stringSimilarity.compareTwoStrings(normalizedUserLyrics, normalizedChunkLyrics);
        return similarity ; // similarity score between 0 and 1
        //> 0.8 ? similarity : similarity + 0.2
    }

    async comparePitch(userPitch: BasicPitchDto[], chunkPitch: BasicPitchDto[]): Promise<number> {
        if (userPitch.length === 0 || chunkPitch.length === 0) return 0; // avoid empty arrays

        userPitch.sort((a, b) => a.start - b.start); // sort by start time
        chunkPitch.sort((a, b) => a.start - b.start); // sort by start time

        let maxScore = 0;

        for (let i = 0; i < Math.min(userPitch.length, chunkPitch.length); i++) {
            const score = await this.compareOnePitch(userPitch[i], chunkPitch[i]);
            if(score > maxScore) {
                maxScore = score; // get the maximum score
            }
        }

        return maxScore; // max score
    }
}
