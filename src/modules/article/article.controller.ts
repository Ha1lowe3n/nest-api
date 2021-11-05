import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserEntity } from '../user/user.entity';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { UpdateArticleGuard } from './guards/updateArticle.guard';
import { ArticleResponse } from './types/articleResponse.interface';
import { ArticlesResponse } from './types/articlesResponse.interface';

@Controller('articles')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}

    @Get()
    @UseGuards(AuthGuard)
    async findAll(
        @User('id') currentUserId: number,
        @Query() query: any,
    ): Promise<ArticlesResponse> {
        return await this.articleService.findAll(currentUserId, query);
    }

    @Get('feed')
    @UseGuards(AuthGuard)
    async getFeed(
        @User('id') currentUserId: number,
        @Query() query: any,
    ): Promise<ArticlesResponse> {
        return await this.articleService.getFeed(currentUserId, query);
    }

    @Post()
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async create(
        @User() currentUser: UserEntity,
        @Body('article') createArticleDto: CreateArticleDto,
    ): Promise<ArticleResponse> {
        const article = await this.articleService.createArticle(
            currentUser,
            createArticleDto,
        );
        return this.articleService.buildArticleResponse(article);
    }

    @Get(':slug')
    async getArticle(@Param('slug') slug: string): Promise<ArticleResponse> {
        const article = await this.articleService.getArticle(slug);
        return this.articleService.buildArticleResponse(article);
    }

    @Delete(':slug')
    @UseGuards(AuthGuard)
    async deleteArticle(
        @User('id') currentUserId: number,
        @Param('slug') slug: string,
    ) {
        return await this.articleService.deleteArticle(slug, currentUserId);
    }

    @Put(':slug')
    @UseGuards(AuthGuard, UpdateArticleGuard)
    async updateArticle(
        @User('id') currentUserId: number,
        @Param('slug') slug: string,
        @Body('article') updateArticleDto: UpdateArticleDto,
    ): Promise<ArticleResponse> {
        const updatedArticle = await this.articleService.updateAtricle(
            slug,
            updateArticleDto,
            currentUserId,
        );
        return this.articleService.buildArticleResponse(updatedArticle);
    }

    @Post(':slug/favorite')
    @UseGuards(AuthGuard)
    async addArticleToFavorites(
        @User('id') currentUserId: number,
        @Param('slug') slug: string,
    ): Promise<ArticleResponse> {
        const article = await this.articleService.addArticleToFavorites(
            currentUserId,
            slug,
        );
        return this.articleService.buildArticleResponse(article);
    }

    @Delete(':slug/favorite')
    @UseGuards(AuthGuard)
    async deleteArticleFromFavorites(
        @User('id') currentUserId: number,
        @Param('slug') slug: string,
    ): Promise<ArticleResponse> {
        const article = await this.articleService.deleteArticleFromFavorites(
            currentUserId,
            slug,
        );
        return this.articleService.buildArticleResponse(article);
    }
}
