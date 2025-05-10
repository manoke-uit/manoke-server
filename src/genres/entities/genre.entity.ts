import { Song } from "src/songs/entities/song.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('genres')
export class Genre {
    @PrimaryGeneratedColumn('uuid')
    id: string; // @IsString() in dto

    @Column({type: 'varchar', length: 255, unique: true})
    name: string; // @IsString() in dto

    @ManyToMany(() => Song, (song) => song.genres, { onDelete: 'SET NULL'})
    @JoinTable({name: 'song_genres'})
    songs: Song[]; // @IsArray() in dto
}
