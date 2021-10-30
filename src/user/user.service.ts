import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';

import { CreateUserDto } from './dto/createUser.dto';
import { UserEntity } from './user.entity';
import { UserResponse } from './types/userResponse.interface';
import { LoginUserDto } from './dto/loginUser.dto';

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
        if (userByUsername || userByEmail) {
            throw new HttpException(
                'Username or email are taken',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        const newUser = new UserEntity();
        Object.assign(newUser, createUserDto);

        return this.userRepository.save(newUser);
    }

    async loginUser(loginUserDto: LoginUserDto): Promise<UserEntity> {
        const userByEmail = await this.userRepository.findOne(
            { email: loginUserDto.email },
            { select: ['id', 'email', 'username', 'bio', 'image', 'password'] },
        );
        let unhashPassword: boolean;

        if (userByEmail) {
            unhashPassword = await compare(
                loginUserDto.password,
                userByEmail.password,
            );
        }
        if (!userByEmail || !unhashPassword) {
            throw new HttpException(
                'login or password is incorrect',
                HttpStatus.UNAUTHORIZED,
            );
        }

        delete userByEmail.password;
        return userByEmail;
    }

    findById(id: number): Promise<UserEntity> {
        return this.userRepository.findOne(id);
    }

    generateJWT(user: UserEntity): string {
        return sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            process.env.JWT_SECRET,
        );
    }

    buildUserResponse(user: UserEntity): UserResponse {
        return {
            user: {
                ...user,
                token: this.generateJWT(user),
            },
        };
    }
}
