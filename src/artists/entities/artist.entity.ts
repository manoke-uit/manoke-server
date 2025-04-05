import { Check, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('artists')
export class Artist {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    imageUrl: string;

    @Column({ type: 'smallint', nullable: true })
    @Check('popularity >= 0 AND popularity <= 100')
    popularity: number;
}
