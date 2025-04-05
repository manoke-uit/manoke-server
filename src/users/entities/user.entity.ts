import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: number; // @IsUUID() in dto

    @Column({type: 'varchar', length: 255})
    displayName: string; // @IsString() in dto
    
    @Column({type: 'varchar', length: 255, unique: true})
    email: string; // @IsEmail() in dto

    @Column({type: 'varchar', length: 255})
    password: string; // @IsString() in dto

    @Column({type: 'text', nullable: true})
    imageUrl: string; // @IsUrl() in dto

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: string; // @IsDateString() in dto
}
