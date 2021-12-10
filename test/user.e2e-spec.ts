import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserModule } from '../src/user/user.module';
import { UserEntity } from '../src/user/entities/user.entity';
import { CreateUserDto } from '../src/user/dto/create-user.dto';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

describe('UserController (e2e)', () => {
    let app: INestApplication;

    const mockUsers: Omit<UserEntity, 'hashPasword'>[] = [
        {
            id: 1,
            username: 'foo',
            email: 'foo@mail.ru',
            password: '123456',
            bio: '',
            image: '',
        },
    ];

    const mockUserRepository = {
        create: jest.fn().mockImplementation((dto: CreateUserDto) => {
            return {
                id: 2,
                ...dto,
                bio: '',
                image: '',
            };
        }),
        find: jest.fn().mockResolvedValue(mockUsers),
        findOne: jest
            .fn()
            .mockImplementation(
                (options: Pick<UserEntity, 'username' | 'email'>) => {
                    const find = mockUsers.find((user) =>
                        options.email
                            ? user.email === options.email
                            : user.username === options.username,
                    );

                    if (find) {
                        return Promise.resolve(true);
                    }
                    return Promise.resolve(undefined);
                },
            ),
        save: jest
            .fn()
            .mockImplementation((user: UserEntity) =>
                Promise.resolve({ id: Date.now(), ...user }),
            ),
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [UserModule],
        })
            .overrideProvider(getRepositoryToken(UserEntity))
            .useValue(mockUserRepository)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    it('/ (POST) create', async () => {
        return request(app.getHttpServer())
            .post('/users')
            .send({
                user: {
                    username: 'user',
                    email: 'email@mail.ru',
                    password: '123456',
                },
            })
            .expect(201)
            .then((res) => {
                expect(res.body.user.username).toBe('user');
                expect(res.body.user.email).toBe('email@mail.ru');
                expect(res.body.user.id).toBe(2);
                expect(res.body.user.bio).toHaveLength(0);
                expect(res.body.user.image).toHaveLength(0);
            });
    });

    describe('errors', () => {
        describe('errors 409', () => {
            it('/ (POST) create --> username are taken', async () => {
                return request(app.getHttpServer())
                    .post('/users')
                    .send({
                        user: {
                            username: 'foo',
                            email: 'email@mail.ru',
                            password: '123456',
                        },
                    })
                    .expect(409)
                    .expect({ statusCode: 409, message: 'Username are taken' });
            });

            it('/ (POST) create --> email are taken', async () => {
                return request(app.getHttpServer())
                    .post('/users')
                    .send({
                        user: {
                            username: 'foa',
                            email: 'foo@mail.ru',
                            password: '123456',
                        },
                    })
                    .expect(409)
                    .expect({ statusCode: 409, message: 'Email are taken' });
            });
        });

        describe('errors validation', () => {
            it('/ (POST) create --> username is empty', async () => {
                return request(app.getHttpServer())
                    .post('/users')
                    .send({
                        user: {
                            username: '',
                            email: 'email@mail.ru',
                            password: '123456',
                        },
                    })
                    .expect(400)
                    .expect({
                        statusCode: 400,
                        message: ['username should not be empty'],
                        error: 'Bad Request',
                    });
            });

            it('/ (POST) create --> username is not string', async () => {
                return request(app.getHttpServer())
                    .post('/users')
                    .send({
                        user: {
                            username: 123,
                            email: 'email@mail.ru',
                            password: '123456',
                        },
                    })
                    .expect(400)
                    .expect({
                        statusCode: 400,
                        message: ['username must be a string'],
                        error: 'Bad Request',
                    });
            });

            it('/ (POST) create --> email is empty', async () => {
                return request(app.getHttpServer())
                    .post('/users')
                    .send({
                        user: {
                            username: 'foa',
                            email: '',
                            password: '123456',
                        },
                    })
                    .expect(400)
                    .expect({
                        statusCode: 400,
                        message: [
                            'email must be an email',
                            'email should not be empty',
                        ],
                        error: 'Bad Request',
                    });
            });

            it('/ (POST) create --> email is not email', async () => {
                return request(app.getHttpServer())
                    .post('/users')
                    .send({
                        user: {
                            username: 'foa',
                            email: 'rararar',
                            password: '123456',
                        },
                    })
                    .expect(400)
                    .expect({
                        statusCode: 400,
                        message: ['email must be an email'],
                        error: 'Bad Request',
                    });
            });

            it('/ (POST) create --> password is empty', async () => {
                return request(app.getHttpServer())
                    .post('/users')
                    .send({
                        user: {
                            username: 'foa',
                            email: 'email@mail.ru',
                            password: '',
                        },
                    })
                    .expect(400)
                    .expect({
                        statusCode: 400,
                        message: [
                            'password must be longer than or equal to 6 characters',
                            'password should not be empty',
                        ],
                        error: 'Bad Request',
                    });
            });

            it('/ (POST) create --> password is too short', async () => {
                return request(app.getHttpServer())
                    .post('/users')
                    .send({
                        user: {
                            username: 'foa',
                            email: 'email@mail.ru',
                            password: '123',
                        },
                    })
                    .expect(400)
                    .expect({
                        statusCode: 400,
                        message: [
                            'password must be longer than or equal to 6 characters',
                        ],
                        error: 'Bad Request',
                    });
            });

            it('/ (POST) create --> password is too long', async () => {
                return request(app.getHttpServer())
                    .post('/users')
                    .send({
                        user: {
                            username: 'foa',
                            email: 'email@mail.ru',
                            password:
                                '435654635473654746575647546745684567876484687746856785678567856786578567865875',
                        },
                    })
                    .expect(400)
                    .expect({
                        statusCode: 400,
                        message: [
                            'password must be shorter than or equal to 30 characters',
                        ],
                        error: 'Bad Request',
                    });
            });
        });
    });
});
