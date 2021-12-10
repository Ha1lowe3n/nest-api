import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagEntity } from './entities/tag.entity';
import { TagService } from './tag.service';

describe('TagService', () => {
    let service: TagService;

    const mockTagRepository = {
        create: jest.fn().mockImplementation((dto: CreateTagDto) => dto),
        save: jest
            .fn()
            .mockImplementation((tag) =>
                Promise.resolve({ id: Date.now(), ...tag }),
            ),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TagService,
                {
                    provide: getRepositoryToken(TagEntity),
                    useValue: mockTagRepository,
                },
            ],
        }).compile();

        service = module.get<TagService>(TagService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('method create should create a new tag record and return that', async () => {
        const dto = { title: 'yehoo' };
        const tag = await service.create(dto);

        expect(tag).toEqual({
            id: expect.any(Number),
            title: 'yehoo',
        });
    });
});
