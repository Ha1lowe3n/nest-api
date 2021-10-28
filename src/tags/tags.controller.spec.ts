import { TagsService } from './tags.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TagsController } from './tags.controller';

describe('TagsController', () => {
    let controller: TagsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TagsController],
            providers: [TagsService],
        }).compile();

        controller = module.get<TagsController>(TagsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return array of strings', () => {
        expect(controller.findAll()).toEqual(['dragons, coffee']);
    });
});
