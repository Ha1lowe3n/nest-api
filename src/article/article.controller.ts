import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserEntity } from 'src/user/entities/user.entity';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('articles')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}

    @Post()
    @UseGuards(AuthGuard)
    create(
        @User() currentUser: UserEntity,
        @Body('article') dto: CreateArticleDto,
    ) {
        return this.articleService.create(dto, currentUser);
    }

    @Get()
    findAll() {
        return this.articleService.findAll();
    }
}
