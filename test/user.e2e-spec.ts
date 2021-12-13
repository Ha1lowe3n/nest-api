import { Test, TestingModule } from '@nestjs/testing';
import {
    INestApplication,
    MiddlewareConsumer,
    Module,
    RequestMethod,
    ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserModule } from '../src/user/user.module';
import { UserEntity } from '../src/user/entities/user.entity';
import { CreateUserDto } from '../src/user/dto/create-user.dto';
import { config as dotenvConfig } from 'dotenv';
import { hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { AuthMiddleware } from '../src/user/middlewares/auth.middleware';

dotenvConfig();

@Module({
    imports: [UserModule],
})
export class TestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes({
            path: '*',
            method: RequestMethod.ALL,
        });
    }
}

describe('UserController (e2e)', () => {
    let app: INestApplication;

    const mockUsers = async (): Promise<Omit<UserEntity, 'hashPassword'>[]> => {
        return [
            {
                id: 1,
                username: 'foo',
                email: 'foo@mail.ru',
                password: await hash('123456', 10),
                bio: '',
                image: '',
            },
        ];
    };

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
                async (
                    options: Pick<UserEntity, 'username' | 'email'> | number,
                ) => {
                    const users = await mockUsers();
                    const find = users.find((user) => {
                        if (typeof options === 'object') {
                            return options.email
                                ? user.email === options.email
                                : user.username === options.username;
                        } else {
                            return user.id === options;
                        }
                    });

                    if (find) {
                        return Promise.resolve(find);
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

    const token = sign(
        {
            id: 1,
            username: 'foo',
            email: 'foo@mail.ru',
        },
        process.env.JWT_SECRET,
    );

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [TestModule],
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
                expect(res.body.user.bio).toHaveLength(0);
                expect(res.body.user.image).toHaveLength(0);
            });
    });

    it('/ (GET) get current user', async () => {
        return request(app.getHttpServer())
            .get('/user')
            .set({ Authorization: `Token ${token}` })
            .expect(200)
            .then((res) => {
                expect(res.body.user.username).toBe('foo');
                expect(res.body.user.email).toBe('foo@mail.ru');
                expect(res.body.user.bio).toHaveLength(0);
                expect(res.body.user.image).toHaveLength(0);
                expect(res.body.user.token).toBeDefined();
            });
    });

    it('/ (POST) login', async () => {
        return request(app.getHttpServer())
            .post('/users/login')
            .send({
                user: {
                    email: 'foo@mail.ru',
                    password: '123456',
                },
            })
            .expect(200)
            .then((res) => {
                expect(res.body.user.username).toBe('foo');
                expect(res.body.user.email).toBe('foo@mail.ru');
                expect(res.body.user.bio).toHaveLength(0);
                expect(res.body.user.image).toHaveLength(0);
                expect(res.body.user.token).toBeDefined();
            });
    });

    it('/ (PATCH) update', async () => {
        return request(app.getHttpServer())
            .patch('/user')
            .set({ Authorization: `Token ${token}` })
            .send({
                user: {
                    bio: 'lala',
                    image: 'rara',
                },
            })
            .expect(200)
            .then((res) => {
                expect(res.body.user.username).toBe('foo');
                expect(res.body.user.email).toBe('foo@mail.ru');
                expect(res.body.user.bio).toHaveLength(4);
                expect(res.body.user.image).toHaveLength(4);
                expect(res.body.user.token).toBeDefined();
            });
    });

    describe('errors', () => {
        describe('errors from guard auth', () => {
            it('/ (GET) get current user --> invalid token', async () => {
                return request(app.getHttpServer())
                    .get('/user')
                    .set({ Authorization: `Token fdddfh` })
                    .expect(401)
                    .expect({ statusCode: 401, message: 'Not authorized' });
            });

            it('/ (PATCH) update --> invalid token', async () => {
                return request(app.getHttpServer())
                    .patch('/user')
                    .set({ Authorization: `Token hfjf` })
                    .send({
                        user: {
                            bio: 'lala',
                            image: 'rara',
                        },
                    })
                    .expect(401)
                    .expect({ statusCode: 401, message: 'Not authorized' });
            });
        });

        describe('errors from service', () => {
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

            it('/ (POST) login --> email is not valid', async () => {
                return request(app.getHttpServer())
                    .post('/users/login')
                    .send({
                        user: {
                            email: 'f@mail.ru',
                            password: '123456',
                        },
                    })
                    .expect(401)
                    .expect({ statusCode: 401, message: 'Email is not valid' });
            });

            it('/ (POST) login --> password is not valid', async () => {
                return request(app.getHttpServer())
                    .post('/users/login')
                    .send({
                        user: {
                            email: 'foo@mail.ru',
                            password: '222222',
                        },
                    })
                    .expect(401)
                    .expect({
                        statusCode: 401,
                        message: 'Password is not valid',
                    });
            });
        });

        describe('errors validation', () => {
            it('/ (PATCH) update --> incorrect type of fields', async () => {
                return request(app.getHttpServer())
                    .patch('/user')
                    .set({ Authorization: `Token ${token}` })
                    .send({
                        user: {
                            bio: 123,
                            image: 123,
                        },
                    })
                    .expect(400)
                    .expect({
                        statusCode: 400,
                        message: [
                            'bio must be a string',
                            'image must be a string',
                        ],
                        error: 'Bad Request',
                    });
            });

            describe('create', () => {
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

            describe('login', () => {
                it('/ (POST) login --> email is empty', async () => {
                    return request(app.getHttpServer())
                        .post('/users/login')
                        .send({
                            user: {
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

                it('/ (POST) login --> email is not email', async () => {
                    return request(app.getHttpServer())
                        .post('/users/login')
                        .send({
                            user: {
                                email: 'fdgdf',
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

                it('/ (POST) login --> password is empty', async () => {
                    return request(app.getHttpServer())
                        .post('/users/login')
                        .send({
                            user: {
                                email: 'foo@mail.ru',
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

                it('/ (POST) login --> password is too short', async () => {
                    return request(app.getHttpServer())
                        .post('/users/login')
                        .send({
                            user: {
                                email: 'foo@mail.ru',
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

                it('/ (POST) login --> password is too long', async () => {
                    return request(app.getHttpServer())
                        .post('/users/login')
                        .send({
                            user: {
                                email: 'foo@mail.ru',
                                password:
                                    '4654563456346346456464564564565464564564563456456345634653456456453634634563456345',
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
});
