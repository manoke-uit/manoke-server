import { Song } from "src/songs/entities/song.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum KaraokeStatus {
    PUBLIC = 'public',
    PRIVATE = 'private',
    PENDING = 'pending',
}

@Entity('karaokes')
export class Karaoke {
    @PrimaryGeneratedColumn('uuid')
    id: string; // @IsString() in dto

    @Column({type: 'text', nullable: true})
    description: string;

    @Column({type: 'varchar', length: 255, nullable: true})
    videoUrl: string; // @IsUrl() in dto

    @Column({type: 'enum', enum: KaraokeStatus, default: 'private'})
    status: KaraokeStatus; // @IsEnum() in dto

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date; // @IsDateString() in dto

    @ManyToOne(() => Song, (song) => song.karaokes, {nullable: true, onDelete: 'SET NULL'})
    song: Song | null; // @IsArray() in dto

    @ManyToOne(() => User, (user) => user.karaokes, { onDelete: 'SET NULL'})
    user: User; // @IsString() in dto

}
