import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagEntity } from './entities/tag.entity';
import { IResponse } from './interfaces/response.interface';

@Injectable()
export class TagService {
    constructor(
        @InjectRepository(TagEntity)
        private readonly tagRepository: Repository<TagEntity>,
    ) {}

    async findAll(): Promise<IResponse> {
        const tags = await this.tagRepository.find();
        return this.buildResponse(tags);
    }

    async create(dto: CreateTagDto): Promise<TagEntity> {
        const tag = new TagEntity();
        Object.assign(tag, dto);
        return await this.tagRepository.save(tag);
    }

    buildResponse(tags: TagEntity[]) {
        return {
            tags: [...tags],
        };
    }
}
