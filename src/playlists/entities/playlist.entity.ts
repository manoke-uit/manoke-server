import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('playlists')
export class Playlist {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({type: 'varchar', length: 255})
    title: string;

    @Column({type: 'text', nullable: true})
    imageUrl: string;

    @Column({type: 'text'})
    description: string;

    // add user relationship later
}
