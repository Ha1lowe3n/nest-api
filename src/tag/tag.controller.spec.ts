import { Test, TestingModule } from '@nestjs/testing';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

describe('TagController', () => {
    let controller: TagController;

    const mockTagService = {
        findAll: jest.fn(() => {
            return {
                tags: ['coffee', 'dragons'],
            };
        }),
        create: jest.fn().mockImplementation((dto: CreateTagDto) => {
            return {
                id: 1,
                ...dto,
            };
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TagController],
            providers: [TagService],
        })
            .overrideProvider(TagService)
            .useValue(mockTagService)
            .compile();

        controller = module.get<TagController>(TagController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('method findAll should return all tags', async () => {
        const data = await controller.findAll();

        expect(data).toEqual({
            tags: expect.arrayContaining(['coffee', 'dragons']),
        });
        expect(mockTagService.findAll).toHaveBeenCalled();
    });

    it('method create should create a new tag and return that', async () => {
        const dto = { title: 'yehoo' };
        const tag = await controller.create(dto);

        expect(tag).toEqual({
            id: expect.any(Number),
            title: 'yehoo',
        });
        expect(mockTagService.create).toHaveBeenCalledWith(dto);
    });
});
