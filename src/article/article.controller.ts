import { Controller, Get, Post, Body } from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('articles')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}

    @Post()
    create(@Body() createArticleDto: CreateArticleDto) {
        return this.articleService.create(createArticleDto);
    }

    @Get()
    findAll() {
        return this.articleService.findAll();
    }
}
