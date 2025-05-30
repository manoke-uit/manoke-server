import { Song } from "src/songs/entities/song.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Index(['user', 'title'], { unique: true })
@Entity('playlists')
export class Playlist {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'varchar', length: 255})
    title: string;

    @Column({type: 'text', nullable: true})
    imageUrl?: string;

    @Column({type: 'text'})
    description?: string;

    @Column({type: 'boolean', default: false})
    isPublic: boolean; // @IsBoolean() in dto

    @ManyToOne(() => User, (user) => user.playlists, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User; // @IsUUID() in dto

    @ManyToMany(() => Song, (song) => song.playlists, { cascade: true })
    @JoinTable({ name:'playlist_songs'})
    songs: Song[]; // @IsArray() in dto
}
