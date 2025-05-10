import { ApiProperty } from "@nestjs/swagger";

export class BasicPitchDto {

    @ApiProperty({ description: 'The start time of the note in seconds' })
    start: number;
    
    @ApiProperty({ description: 'The end time of the note in seconds' })
    end: number;
    
    @ApiProperty({ description: 'The pitch of the note' })
    pitch: number;

    @ApiProperty({ description: 'The confidence level of the pitch detection' })
    confidence: number;
}