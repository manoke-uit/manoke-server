import { Score } from "src/scores/entities/score.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Comment } from "src/comments/entities/comment.entity";
import { User } from "src/users/entities/user.entity";

@Entity('posts')
export class Post {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    description: string;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date; // @IsDateString() in dto

    @OneToOne(() => Score, (score) => score.post, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'scoreId' })
    score: Score; // @IsUUID() in dto

    @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
    comments: Comment[]; // @IsArray() in dto

    @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User; // @IsUUID() in dto
}
