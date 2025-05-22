import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('user_devices')
export class UserDevice {
    @PrimaryGeneratedColumn('uuid') // should not use a pair of primary column as cannot modified that record when updating
    id: string; // @IsUUID() in dto

    @ManyToOne(() => User, user => user.userDevices) // Quan hệ với Entity User
    @JoinColumn({ name: 'user_id' }) // Liên kết với cột 'user_id' trong DB (tức là thuộc tính userId)
    user: User; // Đây là thuộc tính TypeORM sẽ load đối tượng User vào
    
    @Column({ type: 'varchar', length: 255, unique: true })
    expoPushToken: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastRegisteredAt?: Date; // @IsDateString() in dto

}