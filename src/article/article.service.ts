import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import slugify from 'slugify';

import { UserEntity } from 'src/user/user.entity';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleResponse } from './types/articleResponse.interface';
import { UpdateArticleDto } from './dto/updateArticle.dto';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articleRepository: Repository<ArticleEntity>,
    ) {}

    async createArticle(
        currentUser: UserEntity,
        createArticleDto: CreateArticleDto,
    ): Promise<ArticleEntity> {
        const article = new ArticleEntity();
        Object.assign(article, createArticleDto);

        if (!article.tagList) {
            article.tagList = [];
        }

        article.slug = this.getSlug(createArticleDto.title);

        // магия typeorm
        // typeorm сам поймет, что в author нужно записать user.id, т.к. мы описали это на уровне postgres
        article.author = currentUser;

        return await this.articleRepository.save(article);
    }

    async getArticle(slug: string): Promise<ArticleEntity> {
        const findArticle = await this.articleRepository.findOne({ slug });

        if (!findArticle) {
            throw new HttpException('Slug is incorrect', HttpStatus.NOT_FOUND);
        }

        return findArticle;
    }

    async deleteArticle(
        slug: string,
        currentUserId: number,
    ): Promise<DeleteResult> {
        const findArticle = await this.articleRepository.findOne({ slug });

        if (!findArticle) {
            throw new HttpException('Slug is incorrect', HttpStatus.NOT_FOUND);
        }
        if (findArticle.author.id !== currentUserId) {
            throw new HttpException(
                'You are not an author',
                HttpStatus.FORBIDDEN,
            );
        }

        return await this.articleRepository.delete({ slug });
    }

    async updateAtricle(
        slug: string,
        updateArticleDto: UpdateArticleDto,
        currentUserId: number,
    ): Promise<ArticleEntity> {
        const findArticle = await this.articleRepository.findOne({ slug });

        if (!findArticle) {
            throw new HttpException('Slug is incorrect', HttpStatus.NOT_FOUND);
        }
        if (findArticle.author.id !== currentUserId) {
            throw new HttpException(
                'You are not an author',
                HttpStatus.FORBIDDEN,
            );
        }

        if (updateArticleDto.title) {
            findArticle.slug = this.getSlug(updateArticleDto.title);
        }
        Object.assign(findArticle, updateArticleDto);
        return await this.articleRepository.save(findArticle);
    }

    buildArticleResponse(article: ArticleEntity): ArticleResponse {
        return { article };
    }

    private getSlug(title: string): string {
        return (
            slugify(title, { lower: true }) +
            '-' +
            ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
        );
    }
}
