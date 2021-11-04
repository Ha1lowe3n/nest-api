import { TypeOrmModule } from '@nestjs/typeorm';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { TagsModule } from './modules/tag/tag.module';
import { UserModule } from './modules/user/user.module';
import config from './ormconfig';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { ArticleModule } from './modules//article/article.module';

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
