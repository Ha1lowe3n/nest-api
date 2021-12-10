import { Controller, Get, Post, Body } from '@nestjs/common';
import { TagService } from './tag.service';
import { IResponse } from './interfaces/response.interface';
import { TagEntity } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';

@Controller('tags')
export class TagController {
    constructor(private readonly tagService: TagService) {}

    @Get()
    async findAll(): Promise<IResponse> {
        return await this.tagService.findAll();
    }

    @Post()
    async create(@Body() dto: CreateTagDto): Promise<TagEntity> {
        return await this.tagService.create(dto);
    }
}
