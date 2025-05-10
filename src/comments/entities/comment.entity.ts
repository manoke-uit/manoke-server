import { Post } from "src/posts/entities/post.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string; // @IsUUID() in dto

    @Column({ type: 'text' })
    comment: string; // @IsString() in dto

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date; // @IsDateString() in dto

    @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
    post: Post; // @IsUUID() in dto

    @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User; // @IsUUID() in dto
}
