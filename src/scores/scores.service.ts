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

@Injectable()
export class ScoresService {
  @InjectRepository(Score)
  private readonly scoreRepository: Repository<Score>;
  constructor(private readonly songsService : SongsService, private readonly httpService : HttpService, private readonly supabaseStorageService : SupabaseStorageService,
    private readonly usersService : UsersService, private readonly configService : ConfigService){}
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

  async calculateScore(buffer: Buffer, fileName: string): Promise<number> {
    const userLyrics = await this.getLyricsFromRecording(buffer, fileName); // get the lyrics from the recording
    //console.log('User Lyrics:', userLyrics);
    return 0; // TODO
  }

  async getLyricsFromRecording(buffer: Buffer, fileName: string): Promise<string> {
    const form = new FormData();
    const stream = Readable.from(buffer); // create a readable stream from the buffer
    form.append('file', stream, fileName); // append the file to the form data

    const whisperApiUrl = this.configService.get<string>('HUGGING_FACE_WHISPER_URL') || "https://hankhongg-manoke-whisper-server.hf.space/transcribe";
    console.log('⏳ Starting Whisper call');
    try {
      
      const response = await firstValueFrom(this.httpService.post(whisperApiUrl, form, {
        headers: {
          ...form.getHeaders(),
        }
      }).pipe(timeout(30000))); // set a timeout of 30 seconds
      //console.log('Response from Whisper API:', response.data);
      return response.data.transcription; // return the transcription from the response
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('File upload failed');
    }
  }
}
