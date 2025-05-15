import { Injectable } from '@nestjs/common';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { Score } from './entities/score.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SongsService } from 'src/songs/songs.service';
import { UsersService } from 'src/users/users.service';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { SupabaseStorageService } from 'src/supabase-storage/supabase-storage.service';
import { firstValueFrom, timeout } from 'rxjs';
import { Readable } from 'stream';
import { AudioService } from 'src/helpers/audio/audio.service';
import { BasicPitchDto } from 'src/helpers/audio/dto/basic-pitch.dto';

@Injectable()
export class ScoresService {
  @InjectRepository(Score)
  private readonly scoreRepository: Repository<Score>;
  constructor(private readonly songsService : SongsService, private readonly httpService : HttpService, private readonly supabaseStorageService : SupabaseStorageService,
    private readonly usersService : UsersService, private readonly configService : ConfigService, private audioService : AudioService){}
  async create(createScoreDto: CreateScoreDto, buffer: Buffer) : Promise<Score> {
    const score = new Score();
    score.finalScore = createScoreDto.finalScore || 0; // set finalScore to 0 if not provided
    score.createdAt = new Date(Date.now());
    // find user and song by id and set them in the score
    const foundUser = await this.usersService.findOne(createScoreDto.userId);
    if(!foundUser) {
      throw new Error("User not found");
    }
    const foundSong = await this.songsService.findOne(createScoreDto.songId);
    if(!foundSong) {
      throw new Error("Song not found");
    }
    score.user = foundUser;
    score.song = foundSong;

    const fileName = `${createScoreDto.userId}-${createScoreDto.songId}-${Date.now()}.wav`; // create a unique file name
    try {
      const uploadedAudio =  await this.supabaseStorageService.uploadRecordingFromBuffer(buffer, fileName); // upload the file to Supabase storage
      score.audioUrl = uploadedAudio || ""; // set the audioUrl in the score
    }
    catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('File upload failed');
    }
    

    return this.scoreRepository.save(score);
  }

  findAll() {
    return `This action returns all scores`;
  }

  findOne(id: number) {
    return `This action returns a #${id} score`;
  }

  update(id: number, updateScoreDto: UpdateScoreDto) {
    return `This action updates a #${id} score`;
  }

  remove(id: number) {
    return `This action removes a #${id} score`;
  }

  async calculateScore(buffer: Buffer, fileName: string, songId: string): Promise<number> {
   const foundSong = await this.songsService.findOne(songId); // find the song by id
    if(!foundSong) {
      throw new Error("Song not found");
    }

    console.log("foundSong", foundSong); // log the found song for debugging


    const songFileName = `${Date.now()}-${songId}.wav`; // create a unique file name
    const songBuffer = await this.audioService.fetchBufferFromUrl(foundSong.songUrl); // made sure to be 30s
    const songLyrics = foundSong.lyrics; // get the lyrics from the song
    const songPitch = await this.getPitchFromRecording(songBuffer, songFileName); 

    console.log('Song Pitch:', songPitch); // log the song pitch for debugging
   
    console.log("songLyrics", songLyrics); // log the song lyrics for debugging

    // const chunks = await this.audioService.splitAudioFile(songBuffer, songFileName); // split the audio file into chunks
    const audioFileName = `${Date.now()}-${fileName}.wav`; // create a unique file name
    const chunks = await this.audioService.splitAudioFile(buffer, audioFileName); // split the audio file into chunks
    let wholeChunkLyrics: string = ""; // variable to hold the whole chunk lyrics

    const scores : number[] = []; // array to hold the scores for each chunk 
    for (const [index, chunk] of chunks.entries()) {
      const chunkFileName = `${Date.now()}-${songId}-${index}.wav`;
      await sleep(3000); 
      const chunkLyrics = await this.getLyricsFromRecording(chunk, chunkFileName);
      const chunkPitch = await this.getPitchFromRecording(chunk, chunkFileName);
      console.log('Chunk Pitch:', chunkPitch);
      console.log('Chunk Lyrics:', chunkLyrics);
      wholeChunkLyrics += chunkLyrics; // set the whole chunk lyrics to the current chunk lyrics
      // compare to the user pitch and lyrics then give out the score 0.5 for pitch and 0.5 for lyrics
      const pitchScore = await this.audioService.comparePitch(songPitch, chunkPitch); // compare the pitch information
      //const lyricsScore = await this.audioService.compareLyrics(songLyrics, chunkLyrics); // compare the lyrics
      console.log('Pitch Score:', pitchScore); // log the pitch score for debugging
      //console.log('Lyrics Score:', lyricsScore); // log the lyrics score for debugging

      scores.push(pitchScore); // add the score to the array
    }

    if (scores.length === 0) {
      console.error('No valid chunk scores were calculated!');
      return 0;
    }
    console.log('Scores:', scores); // log the scores for debugging
    console.log(scores.length, 'chunks found');

    const maxPitchScore = Math.max(...scores); // get the maximum score from the array
    const lyricsScore = await this.audioService.compareLyrics(songLyrics, wholeChunkLyrics); // compare the lyrics
    console.log('Lyrics Score:', lyricsScore); // log the lyrics score for debugging

    const calculatedScore = (maxPitchScore + lyricsScore) / 2; // calculate the final score
    console.log('Calculated Score:', calculatedScore); // log the calculated score for debugging
    //console.log('User Lyrics:', userLyrics);
    
    return calculatedScore * 100; // TODO
  }

  async getLyricsFromRecording(buffer: Buffer, fileName: string): Promise<string> {
    const form = new FormData();
    const stream = Readable.from(buffer); // create a readable stream from the buffer
    form.append('file', stream, fileName); // append the file to the form data

    const whisperApiUrl = this.configService.get<string>('HUGGING_FACE_WHISPER_URL') || "https://hankhongg-manoke-whisper-server.hf.space/transcribe";
    //console.log('Starting Whisper call');
    try {
      
      const response = await firstValueFrom(this.httpService.post(whisperApiUrl, form, {
        headers: {
          ...form.getHeaders(),
        }
      }).pipe(timeout(10000 * 6 * 5))); // set a timeout of 5 minutes
      //console.log('Response from Whisper API:', response.data);
      return response.data.transcription; // return the transcription from the response
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('File upload failed');
    }
  }

  async getPitchFromRecording(buffer: Buffer, fileName: string): Promise<BasicPitchDto[]> {
    const form = new FormData();
    const stream = Readable.from(buffer); // create a readable stream from the buffer
    form.append('file', stream, fileName); // append the file to the form data

    const basicPitchApiUrl = this.configService.get<string>('RENDER_BASIC_PITCH_URL') || "https://manoke-basic-pitch-server.onrender.com/analyze-pitch";
    //console.log('Starting basicPitch call');
    try {
      
      const response = await firstValueFrom(this.httpService.post(basicPitchApiUrl, form, {
        headers: {
          ...form.getHeaders(),
        }
      }).pipe(timeout(10000 * 6 * 5))); // set a timeout of 5 minutes
      const pitchData = response.data.pitch_data;

      if (!pitchData || !Array.isArray(pitchData)) {
        console.error("Invalid pitch data returned");
        return [];
      }
      return pitchData.map((item: any) => ({
        start: item.window_start,
        end: item.window_end,
        pitch: item.average_pitch,
        confidence: item.average_confidence,
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('File upload failed');
    }
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}