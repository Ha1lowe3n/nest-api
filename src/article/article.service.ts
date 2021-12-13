import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleEntity } from './entities/article.entity';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly tagRepository: Repository<ArticleEntity>,
    ) {}

    create(createArticleDto: CreateArticleDto) {
        return 'This action adds a new article';
    }

    findAll() {
        return `This action returns all article`;
    }
}
