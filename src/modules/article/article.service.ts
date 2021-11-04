import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import slugify from 'slugify';

import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleResponse } from './types/articleResponse.interface';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { ArticlesResponse } from './types/articlesResponse.interface';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articleRepository: Repository<ArticleEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async findAll(
        currentUserId: number,
        query: any,
    ): Promise<ArticlesResponse> {
        const queryBuilder = getRepository(ArticleEntity)
            .createQueryBuilder('articles')
            .leftJoinAndSelect('articles.author', 'author');

        queryBuilder.orderBy('articles.createdAt', 'DESC');

        const articlesCount = await queryBuilder.getCount();

        if (query.tag) {
            queryBuilder.andWhere('articles.tagList LIKE :tag', {
                tag: `%${query.tag}%`,
            });
        }
        if (query.author) {
            const author = await this.userRepository.findOne({
                username: query.author,
            });

            queryBuilder.andWhere('author.id = :id', {
                id: author ? author.id : null,
            });
        }
        if (query.limit) {
            queryBuilder.limit(query.limit);
        }
        if (query.offset) {
            queryBuilder.offset(query.offset);
        }
        if (query.favorited) {
            const author = await this.userRepository.findOne(
                {
                    username: query.favorited,
                },
                { relations: ['favorites'] },
            );

            const arrOfFavorites = author?.favorites.map((el) => el.id);

            queryBuilder.andWhere('articles.id IN (:...arrOfFavorites)', {
                arrOfFavorites:
                    arrOfFavorites?.length > 0 ? arrOfFavorites : [0],
            });
        }

        let favoriteIds: number[] = [];
        if (currentUserId) {
            const currentUser = await this.userRepository.findOne(
                currentUserId,
                { relations: ['favorites'] },
            );
            favoriteIds = currentUser.favorites.map((favorite) => favorite.id);
        }

        const articles = await queryBuilder.getMany();
        const articlesWithFavorited = articles.map((article) => {
            const favorited = favoriteIds.includes(article.id);
            return { ...article, favorited };
        });

        return { articles: articlesWithFavorited, articlesCount };
    }

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

    async addArticleToFavorites(
        currentUserId: number,
        slug: string,
    ): Promise<ArticleEntity> {
        const article = await this.articleRepository.findOne({ slug });

        // relations - полуучаем value отношений, без явного указания eager в сущности
        // eager - всегда добавляем value, relations - только сейчас
        const user = await this.userRepository.findOne(currentUserId, {
            relations: ['favorites'],
        });
        const isNotFavorited = user.favorites.findIndex(
            (articleInFavorites) => articleInFavorites.id === article.id,
        );

        if (isNotFavorited === -1) {
            user.favorites.push(article);
            article.favotitesCount++;
            await this.userRepository.save(user);
            await this.articleRepository.save(article);
        }

        return article;
    }

    async deleteArticleFromFavorites(
        currentUserId: number,
        slug: string,
    ): Promise<ArticleEntity> {
        const article = await this.articleRepository.findOne({ slug });
        const user = await this.userRepository.findOne(currentUserId, {
            relations: ['favorites'],
        });
        const articleIndex = user.favorites.findIndex(
            (articleInFavorites) => articleInFavorites.id === article.id,
        );

        if (articleIndex >= 0) {
            user.favorites.splice(articleIndex, 1);
            article.favotitesCount--;
            await this.userRepository.save(user);
            await this.articleRepository.save(article);
        }

        return article;
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
