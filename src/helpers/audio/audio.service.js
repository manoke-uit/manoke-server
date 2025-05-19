"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioService = void 0;
const common_1 = require("@nestjs/common");
const os_1 = require("os");
const path_1 = require("path");
const fs_1 = require("fs");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const axios = require("axios");
const stringSimilarity = require("string-similarity");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
let AudioService = class AudioService {
    async splitAudioFile(buffer, fileName, chunkDuration = 30) {
        const tempInputPath = (0, path_1.join)((0, os_1.tmpdir)(), `${Date.now()}-${fileName}`);
        const baseName = `${Date.now()}`;
        const outputPattern = (0, path_1.join)((0, os_1.tmpdir)(), `${baseName}-chunk-%03d.wav`);
        (0, fs_1.writeFileSync)(tempInputPath, buffer);
        return new Promise((resolve, reject) => {
            ffmpeg(tempInputPath)
                .outputOptions([
                `-f segment`,
                `-segment_time ${chunkDuration}`,
                `-c copy`,
            ])
                .output(outputPattern)
                .on('end', () => {
                const chunkBuffers = [];
                const baseDir = (0, os_1.tmpdir)();
                let index = 0;
                while (true) {
                    const chunkPath = (0, path_1.join)(baseDir, `${baseName}-chunk-${String(index).padStart(3, '0')}.wav`);
                    if (!fs.existsSync(chunkPath))
                        break;
                    chunkBuffers.push(fs.readFileSync(chunkPath));
                    (0, fs_1.unlinkSync)(chunkPath);
                    index++;
                }
                (0, fs_1.unlinkSync)(tempInputPath);
                resolve(chunkBuffers);
            })
                .on('error', (err) => {
                console.error('FFmpeg error:', err);
                reject(err);
            })
                .run();
        });
    }
    async fetchAudioBufferFromUrl(url) {
        const response = await axios.default.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    }
    async compareOnePitch(songPitch, chunkPitch) {
        const songPitchValue = songPitch.pitch;
        const chunkPitchValue = chunkPitch.pitch;
        if (chunkPitchValue === 0)
            return 0;
        if (songPitchValue === 0)
            return 0;
        const pitchDifference = Math.abs(songPitchValue - chunkPitchValue);
        const pitchTolerance = 1;
        const normalizedDifference = Math.max(0, pitchDifference - pitchTolerance);
        let pitchScore = 1 - (normalizedDifference / 12);
        const confidenceDifference = Math.abs(songPitch.confidence - chunkPitch.confidence);
        const confidenceTolerance = 0.1;
        const normalizedConfidenceDifference = Math.max(0, confidenceDifference - confidenceTolerance);
        const confidenceScore = 1 - (normalizedConfidenceDifference / 1);
        const maxConfidenceScore = Math.max(confidenceScore, songPitch.confidence);
        const pitchConfidenceScore = (pitchScore + maxConfidenceScore) / 2;
        return Math.max(0, Math.min(1, pitchConfidenceScore));
    }
    async compareLyrics(songLyrics, chunkLyrics) {
        const normalize = (text) => text.replace(/\r?\n|\r/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/[.?,!]/g, '')
            .trim()
            .toLowerCase();
        const normalizedsongLyrics = normalize(songLyrics);
        const normalizedChunkLyrics = normalize(chunkLyrics);
        const similarity = stringSimilarity.compareTwoStrings(normalizedsongLyrics, normalizedChunkLyrics);
        return similarity;
    }
    async comparePitch(songPitch, chunkPitch) {
        if (songPitch.length === 0 || chunkPitch.length === 0)
            return 0;
        songPitch.sort((a, b) => a.start - b.start);
        chunkPitch.sort((a, b) => a.start - b.start);
        let maxScore = 0;
        for (let i = 0; i < Math.min(songPitch.length, chunkPitch.length); i++) {
            const score = await this.compareOnePitch(songPitch[i], chunkPitch[i]);
            if (score > maxScore) {
                maxScore = score;
            }
        }
        return maxScore;
    }
};
exports.AudioService = AudioService;
exports.AudioService = AudioService = __decorate([
    (0, common_1.Injectable)()
], AudioService);
//# sourceMappingURL=audio.service.js.map