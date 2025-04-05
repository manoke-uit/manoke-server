import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: string; // @IsDateString() in dto

    @Column({ type: 'boolean', default: false })
    isRead: boolean; // @IsBoolean() in dto

    // add user relationship later
}
