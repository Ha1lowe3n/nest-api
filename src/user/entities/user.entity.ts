import { hash } from 'bcrypt';
import { ArticleEntity } from 'src/article/entities/article.entity';
import {
    BeforeInsert,
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column({ default: '' })
    bio: string;

    @Column({ default: '' })
    image: string;

    @Column({ select: false })
    password: string;

    @OneToMany(() => ArticleEntity, (article) => article.author)
    articles: ArticleEntity[];

    @BeforeInsert()
    private async hashPassword() {
        this.password = await hash(this.password, 10);
    }
}
