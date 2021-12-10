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
        findOne: jest.fn().mockImplementation((options: { select: string }) => {
            const find = mockUsers.find(
                (user) => user[options.select] === options.select,
            );
            if (find) {
                Promise.resolve(true);
            }
            Promise.resolve(undefined);
        }),
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
                console.log(res.body);

                expect(res.body.user.username).toBe('user');
                expect(res.body.user.email).toBe('email@mail.ru');
                expect(res.body.user.id).toBe(2);
                expect(res.body.user.bio).toHaveLength(0);
                expect(res.body.user.image).toHaveLength(0);
            });
    });
});
