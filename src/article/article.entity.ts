import { UserEntity } from 'src/user/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BeforeUpdate,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';

@Entity({ name: 'articles' })
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

    // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    // createdAt: Date;

    // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    // updatedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column('simple-array')
    tagList: string[];

    @Column({ default: 0 })
    favotitesCount: number;

    @ManyToOne(() => UserEntity, (user) => user.articles, { eager: true })
    author: UserEntity;

    // @BeforeUpdate()
    // updateTimestamp() {
    //     this.updatedAt = new Date();
    // }
}
