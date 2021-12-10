import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TagModule } from '../src/tag/tag.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TagEntity } from '../src/tag/entities/tag.entity';

describe('TagController (e2e)', () => {
    let app: INestApplication;

    const mockTags: TagEntity[] = [{ id: 1, title: 'yehoo' }];
    const response = { tags: mockTags };

    const mockTagRepository = {
        find: jest.fn().mockResolvedValue(mockTags),
        save: jest
            .fn()
            .mockImplementation((tag) =>
                Promise.resolve({ id: Date.now(), ...tag }),
            ),
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [TagModule],
        })
            .overrideProvider(getRepositoryToken(TagEntity))
            .useValue(mockTagRepository)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    it('/ (GET) findAll', () => {
        return request(app.getHttpServer())
            .get('/tags')
            .expect(200)
            .expect(response);
    });

    it('/ (POST) create', () => {
        return request(app.getHttpServer())
            .post('/tags')
            .send({ title: 'ratata' })
            .expect(201)
            .then((res) => {
                expect(res.body).toEqual({
                    id: expect.any(Number),
                    title: 'ratata',
                });
            });
    });

    describe('errors validation', () => {
        it('/ (POST) create --> too short title', () => {
            return request(app.getHttpServer())
                .post('/tags')
                .send({ title: 't' })
                .expect(400)
                .expect({
                    statusCode: 400,
                    message: [
                        'title must be longer than or equal to 3 characters',
                    ],
                    error: 'Bad Request',
                });
        });

        it('/ (POST) create --> too long title', () => {
            return request(app.getHttpServer())
                .post('/tags')
                .send({
                    title: 'ttryutyujytjhtyjtyjytjtyjtyjtdyjtjdtjyjthgdhg',
                })
                .expect(400)
                .expect({
                    statusCode: 400,
                    message: [
                        'title must be shorter than or equal to 20 characters',
                    ],
                    error: 'Bad Request',
                });
        });

        it('/ (POST) create --> title is not a number', () => {
            return request(app.getHttpServer())
                .post('/tags')
                .send({ title: 5 })
                .expect(400)
                .expect({
                    statusCode: 400,
                    message: [
                        'title must be a string',
                        'title must be longer than or equal to 3 and shorter than or equal to 20 characters',
                    ],
                    error: 'Bad Request',
                });
        });
    });
});
