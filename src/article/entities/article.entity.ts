import {
    Column,
    CreateDateColumn,
    Entity,
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

    @Column('simple-array')
    tagList: string[];

    @Column('simple-array')
    favoritesCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}
