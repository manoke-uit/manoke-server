import { Artist } from "src/artists/entities/artist.entity";
import { Genre } from "src/genres/entities/genre.entity";
import { Karaoke } from "src/karaokes/entities/karaoke.entity";
import { Playlist } from "src/playlists/entities/playlist.entity";
import { Score } from "src/scores/entities/score.entity";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('songs')
export class Song {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'varchar', length: 255})
    title: string;

    @Column({type: 'text'})
    lyrics: string; // @IsString() in dto
    
    @Column({type: 'text'})
    songUrl: string; // @IsUrl() in dto

    @ManyToMany(() => Artist, (artist) => artist.songs, { cascade: true })
    artists: Artist[]; // @IsArray() in dto

    @ManyToMany(() => Playlist, (playlist) => playlist.songs)
    playlists: Playlist[]; // @IsArray() in dto

    @OneToMany(() => Score, (score) => score.song, { cascade: true })
    scores: Score[]; // @IsArray() in dto

    @OneToMany(() => Karaoke, (karaoke) => karaoke.song, { onDelete: 'SET NULL', nullable: true })
    karaokes: Karaoke[]; // @IsString() in dto

    @ManyToMany(() => Genre, (genre) => genre.songs, { onDelete: 'SET NULL', nullable: true })
    genres: Genre[]; // @IsArray() in dto
}
