import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TagsModule } from './tags/tags.module';

@Module({
    controllers: [AppController],
    providers: [AppService],
    imports: [TagsModule],
})
export class AppModule {}
