import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('songs')
export class Song {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({type: 'varchar', length: 255})
    title: string;

    @Column({type: 'varchar', length: 255})
    albumTitle: string;

    @Column({type: 'text', nullable: true})
    imageUrl: string;

    @Column() // remember to transform to vn format in dto
    releasedDate: string;

    @Column({type: 'int', default: 0})
    duration: number; // @IsNumber() in dto

    @Column({type: 'text'})
    youtubeUrl: string; // @IsUrl() in dto
    
    @Column({type: 'text'})
    spotifyUrl: string; // @IsUrl() in dto
}
