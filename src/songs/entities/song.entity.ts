import { Artist } from "src/artists/entities/artist.entity";
import { Playlist } from "src/playlists/entities/playlist.entity";
import { Score } from "src/scores/entities/score.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('songs')
export class Song {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'varchar', length: 255})
    title: string;

    @Column({type: 'varchar', length: 255})
    albumTitle?: string;

    @Column({type: 'text', nullable: true})
    imageUrl?: string;

    @Column({type: 'date'}) // remember to transform to vn format in dto
    releasedDate?: Date;

    @Column({type: 'int', default: 0})
    duration?: number; // @IsNumber() in dto

    @Column({type: 'text'})
    youtubeUrl: string; // @IsUrl() in dto
    
    @Column({type: 'text'})
    audioUrl: string; // @IsUrl() in dto

    @ManyToMany(() => Artist, (artist) => artist.songs, { cascade: true })
    artists: Artist[]; // @IsArray() in dto

    @ManyToMany(() => Playlist, (playlist) => playlist.songs)
    playlists: Playlist[]; // @IsArray() in dto

    @OneToMany(() => Score, (score) => score.song, { cascade: true })
    scores: Score[]; // @IsArray() in dto
}
