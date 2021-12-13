import { UserEntity } from 'src/user/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('articles')
export class ArticleEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    slug: string;

    @Column()
    title: string;

    @Column({ default: '' })
    description: string;

    @Column({ default: '' })
    body: string;

    @Column('simple-array', { nullable: true })
    tagList: string[];

    @Column({ default: 0 })
    favoritesCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updateAt: Date;

    @ManyToOne(() => UserEntity, (user) => user.articles, {
        onDelete: 'CASCADE',
    })
    author: UserEntity;
}
