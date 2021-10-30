import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TagsModule } from './tag/tag.module';
import { UserModule } from './user/user.module';
import config from './ormconfig';

@Module({
    imports: [TypeOrmModule.forRoot(config), TagsModule, UserModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
