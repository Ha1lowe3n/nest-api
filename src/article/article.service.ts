import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleEntity } from './entities/article.entity';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articleRepository: Repository<ArticleEntity>,
    ) {}

    async create(
        dto: CreateArticleDto,
        currentUser: UserEntity,
    ): Promise<ArticleEntity> {
        const article = this.articleRepository.create(dto);
        article.author = currentUser;
        article.slug = 'foo';
        return await this.articleRepository.save(article);
    }

    findAll() {
        return `This action returns all article`;
    }
}
