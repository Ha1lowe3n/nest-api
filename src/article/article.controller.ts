import {
    Body,
    Controller,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserEntity } from 'src/user/user.entity';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleResponse } from './types/articleResponse.interface';

@Controller('articles')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}

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
}
