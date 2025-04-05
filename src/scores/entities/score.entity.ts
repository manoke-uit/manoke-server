import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity('scores')
export class Score {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({type: 'text'})
    audioUrl: string;

    @Column({type: 'float', default: 0})
    finalScore: number; // @IsNumber() in dto

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: string; // @IsDateString() in dto

    // declare user relationship later

    // declare song relationship later
}
