import { Song } from 'src/songs/entities/song.entity';
import { Check, Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('artists')
export class Artist {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    imageUrl?: string;

    @Column({ type: 'smallint', nullable: true })
    @Check('popularity >= 0 AND popularity <= 100')
    popularity?: number;

    @ManyToMany(() => Song, (song) => song.artists)
    @JoinTable({ name:'artist_songs'})
    songs: Song[]; // @IsArray() in dto
}
