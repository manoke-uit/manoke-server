import { BasicPitchDto } from './dto/basic-pitch.dto';
export declare class AudioService {
    splitAudioFile(buffer: Buffer, fileName: string, chunkDuration?: number): Promise<Buffer[]>;
    fetchAudioBufferFromUrl(url: string): Promise<Buffer>;
    compareOnePitch(songPitch: BasicPitchDto, chunkPitch: BasicPitchDto): Promise<number>;
    compareLyrics(songLyrics: string, chunkLyrics: string): Promise<number>;
    comparePitch(songPitch: BasicPitchDto[], chunkPitch: BasicPitchDto[]): Promise<number>;
}
