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
import * as ffprobeStatic from 'ffprobe-static';


ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeStatic.path);


@Injectable()
export class AudioService {
    async splitAudioFile(buffer: Buffer, fileName: string, chunkDuration = 30): Promise<Buffer[]> {
        const tempInputPath = join(tmpdir(), `${Date.now()}-${fileName}`);
        const baseName = `${Date.now()}`;
        const outputPattern = join(tmpdir(), `${baseName}-chunk-%03d.wav`);

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
                const chunkPath = join(baseDir, `${baseName}-chunk-${String(index).padStart(3, '0')}.wav`);
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

    async fetchBufferFromUrl(url: string): Promise<Buffer> {
        const response = await axios.default.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    }

    async compareOnePitch(songPitch: BasicPitchDto, chunkPitch: BasicPitchDto): Promise<number> {
        const songPitchValue = songPitch.pitch;
        const chunkPitchValue = chunkPitch.pitch;

        if (chunkPitchValue === 0) return 0; // avoid division by zero
        if (songPitchValue === 0) return 0;  // avoid scoring silent sections

        // 1. Pitch difference
        const pitchDifference = Math.abs(songPitchValue - chunkPitchValue);

        // 2. Pitch tolerance (you allow ±1 semitone "mistake")
        const pitchTolerance = 1;
        const normalizedDifference = Math.max(0, pitchDifference - pitchTolerance);

        // 3. Raw pitch score
        let pitchScore = 1 - (normalizedDifference / 12); 
        // 12 because 12 semitones = 1 octave, normalize over 12 instead of using chunkPitchValue
        // so even if song sings one octave wrong it's still considered "far"

        // 4. Compare confidence levels
        // get max of confidence levels OR similarity of the two pitches
        const confidenceDifference = Math.abs(songPitch.confidence - chunkPitch.confidence);
        const confidenceTolerance = 0.1; // 10% tolerance
        const normalizedConfidenceDifference = Math.max(0, confidenceDifference - confidenceTolerance);
        const confidenceScore = 1 - (normalizedConfidenceDifference / 1); // normalize over 1 (0-1 range)

        const maxConfidenceScore = Math.max(confidenceScore, songPitch.confidence)

        // const averageConfidence = (songPitch.confidence + chunkPitch.confidence) / 2;
        // pitchScore *= averageConfidence;
        // 5. Combine scores
        const pitchConfidenceScore = (pitchScore + maxConfidenceScore) / 2; // average of pitch score and confidence score
        // 6. Normalize to 0-1 range
        return Math.max(0, Math.min(1, pitchConfidenceScore));
    }

    // async compareLyrics(songLyrics: string, chunkLyrics: string): Promise<number> {
    //     const normalize = (text: string): string =>
    //         text.replace(/\r?\n|\r/g, ' ')   // Replace all newlines with space
    //             .replace(/\s+/g, ' ')        // Collapse extra spaces
    //             .replace(/[.?,!]/g, '')
    //             .trim()
    //             .toLowerCase();
    //     const normalizedsongLyrics = normalize(songLyrics);
    //     const normalizedChunkLyrics = normalize(chunkLyrics);
    //     const similarity = stringSimilarity.compareTwoStrings(normalizedsongLyrics, normalizedChunkLyrics);
    //     return similarity ; // similarity score between 0 and 1
    //     //> 0.8 ? similarity : similarity + 0.2
    // }

    async compareLyrics(songLyrics: string, chunkLyrics: string): Promise<number> {
        const normalize = (text: string): string =>
            text
            .normalize('NFD')                           // separate accents
            .replace(/[\u0300-\u036f]/g, '')            // remove accents
            .replace(/[.,!?"]/g, '')                    // remove punctuation
            .replace(/\s+/g, ' ')                       // collapse whitespace
            .trim()
            .toLowerCase();

        const tokenize = (text: string): Set<string> =>
            new Set(normalize(text).split(' '));          // convert to unique word set

        const songTokens = tokenize(songLyrics);
        const chunkTokens = tokenize(chunkLyrics);

        if (chunkTokens.size === 0) return 0;

        let matched = 0;
        for (const word of chunkTokens) {
            if (songTokens.has(word)) matched++;
        }

        const score = matched / chunkTokens.size;       // how many chunk words exist in song
        return Number(score.toFixed(4));                // return clean 0.xxx
    }

    async comparePitch(songPitch: BasicPitchDto[], chunkPitch: BasicPitchDto[]): Promise<number> {
        if (songPitch.length === 0 || chunkPitch.length === 0) return 0; // avoid empty arrays

        songPitch.sort((a, b) => a.start - b.start); // sort by start time
        chunkPitch.sort((a, b) => a.start - b.start); // sort by start time

        let maxScore = 0;

        for (let i = 0; i < Math.min(songPitch.length, chunkPitch.length); i++) {
            const score = await this.compareOnePitch(songPitch[i], chunkPitch[i]);
            if(score > maxScore) {
                maxScore = score; // get the maximum score
            }
        }

        return maxScore; // max score
    }

    async getDurationFromBuffer(buffer: Buffer): Promise<number> {
        const tempFilePath = join(tmpdir(), `${Date.now()}-temp.wav`);
        writeFileSync(tempFilePath, buffer);
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
                if (err) {
                    console.error('Error getting duration:', err);
                    reject(err);
                } else {
                    const duration = metadata.format.duration;
                    unlinkSync(tempFilePath); // cleanup
                    resolve(duration);
                }
            });
        });
    }

    async convertM4aToWav(buffer: Buffer): Promise<Buffer> {
        const tempInputPath = join(tmpdir(), `${Date.now()}-input.m4a`);
        const tempOutputPath = join(tmpdir(), `${Date.now()}-output.wav`);

        // Save the buffer to disk temporarily
        writeFileSync(tempInputPath, buffer);

        return new Promise((resolve, reject) => {
            ffmpeg(tempInputPath)
            .toFormat('wav')
            .on('end', () => {
                const outputBuffer = fs.readFileSync(tempOutputPath);
                unlinkSync(tempInputPath); // remove input file
                unlinkSync(tempOutputPath); // remove output file
                resolve(outputBuffer);
            })
            .on('error', (err) => {
                console.error('FFmpeg error:', err);
                reject(err);
            })
            .save(tempOutputPath);
        });
    }
}
