import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TagsModule } from './tags/tags.module';
import config from './ormconfig';

@Module({
    imports: [TypeOrmModule.forRoot(config), TagsModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
