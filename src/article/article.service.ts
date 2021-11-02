import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/createArticle.dto';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articleRepository: Repository<ArticleEntity>,
    ) {}

    async createArticle(
        currentUser: UserEntity,
        createArticleDto: CreateArticleDto,
    ) {
        const article = new ArticleEntity();
        Object.assign(article, createArticleDto);

        if (!article.tagList) {
            article.tagList = [];
        }

        article.slug = 'foo';

        // магия typeorm
        // typeorm сам поймет, что в author нужно записать user.id, т.к. мы описали это на уровне postgres
        article.author = currentUser;

        return await this.articleRepository.save(article);
    }
}
