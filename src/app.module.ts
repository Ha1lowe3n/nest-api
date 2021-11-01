import { TypeOrmModule } from '@nestjs/typeorm';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { TagsModule } from './tag/tag.module';
import { UserModule } from './user/user.module';
import config from './ormconfig';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { ArticleModule } from './article/article.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(config),
        TagsModule,
        UserModule,
        ArticleModule,
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
