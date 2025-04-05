import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

export enum FriendStatus{
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    BLOCKED = 'rejected',
}

@Entity('friends')
export class Friend {
    @PrimaryColumn()
    userId_1: string; // @IsUUID() in dto

    @PrimaryColumn()
    userId_2: string; // @IsUUID() in dto

    @Column({type: 'enum', enum: FriendStatus, default: FriendStatus.PENDING})
    status: FriendStatus; // @IsEnum(FriendStatus) in dto

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // @IsDateString() in dto

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId_1' })
    user_1: User; // @IsUUID() in dto

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId_2' })
    user_2: User; // @IsUUID() in dto

}
