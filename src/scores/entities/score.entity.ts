import { Post } from 'src/posts/entities/post.entity';
import { Song } from 'src/songs/entities/song.entity';
import { User } from 'src/users/entities/user.entity';
import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from 'typeorm';

@Entity('scores')
export class Score {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'text'})
    audioUrl: string;

    @Column({type: 'float', default: 0})
    finalScore: number; // @IsNumber() in dto

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date; // @IsDateString() in dto

    @ManyToOne(() => User, (user) => user.scores, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User; // @IsUUID() in dto

    @ManyToOne(() => Song, (song) => song.scores, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'songId' })
    song: Song; // @IsUUID() in dto

    @OneToOne(() => Post , (post) => post.score, { onDelete: 'CASCADE' })
    post: Post; // @IsUUID() in dto
}
