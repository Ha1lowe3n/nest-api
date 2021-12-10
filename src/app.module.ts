import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { TagModule } from './tag/tag.module';
import ormconfig from './ormconfig';

@Module({
    imports: [TypeOrmModule.forRoot(ormconfig), TagModule],
})
export class AppModule {}
