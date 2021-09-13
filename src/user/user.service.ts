import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { compare } from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './user.entity';
import { JWT_SECRET } from '../config';
import { UserResponseInterface } from '../types/userResponse.interface';
import { LoginUserDto } from './dto/login-user.dro';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
        const userByEmail = await this.userRepository.findOne({
            email: createUserDto.email,
        });
        const userByUsername = await this.userRepository.findOne({
            username: createUserDto.username,
        });
        if (userByEmail || userByUsername) {
            throw new HttpException(
                'Email or username are taken',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        const newUser = new UserEntity();
        Object.assign(newUser, createUserDto);
        return await this.userRepository.save(newUser);
    }

    async loginUser(loginUserDto: LoginUserDto): Promise<UserEntity> {
        const errorValidation = (textError: string) => {
            return new HttpException(textError, HttpStatus.UNAUTHORIZED);
        };

        const user = await this.userRepository.findOne(
            { email: loginUserDto.email },
            { select: ['id', 'username', 'email', 'bio', 'image', 'password'] },
        );
        if (!user) {
            throw errorValidation('Email is incorrect');
        }

        const comparePassword = await compare(
            loginUserDto.password,
            user.password,
        );
        if (!comparePassword) {
            throw errorValidation('Password is incorrect');
        }

        delete user.password;
        return user;
    }

    generateJwt(user: UserEntity): string {
        return jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            JWT_SECRET,
        );
    }

    buildUserResponse(user: UserEntity): UserResponseInterface {
        return {
            user: {
                ...user,
                token: this.generateJwt(user),
            },
        };
    }
}
