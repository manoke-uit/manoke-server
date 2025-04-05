import {Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Notification} from '../../notifications/entities/notification.entity';
import { Playlist } from 'src/playlists/entities/playlist.entity';
import { Score } from 'src/scores/entities/score.entity';
import { Exclude } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: number; // @IsUUID() in dto

    @Column({type: 'varchar', length: 255, nullable: true})
    @Exclude({ toPlainOnly: true }) // Exclude from the response
    adminSecret?: string;

    @Column({type: 'varchar', length: 255})
    displayName: string; // @IsString() in dto
    
    @Column({type: 'varchar', length: 255, unique: true})
    email: string; // @IsEmail() in dto

    @Column({type: 'varchar', length: 255})
    @Exclude({ toPlainOnly: true }) // Exclude password from the response
    password: string; // @IsString() in dto

    @Column({type: 'text', nullable: true})
    imageUrl?: string; // @IsUrl() in dto

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date; // @IsDateString() in dto

    @OneToMany(() => Notification, (notification) => notification.user, { cascade: true })
    notifications: Notification[]; // @IsArray() in dto

    @OneToMany(() => Playlist, (playlist) => playlist.user, { cascade: true })
    playlists: Playlist[]; // @IsArray() in dto

    @OneToMany(() => Score, (score) => score.user, { cascade: true })
    scores: Score[]; // @IsArray() in dto
}
