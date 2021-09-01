import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';

import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './user.entity';
import { JWT_SECRET } from '../config';
import { UserResponseInterface } from '../types/userResponse.interface';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
        const newUser = new UserEntity();
        Object.assign(newUser, createUserDto);
        return await this.userRepository.save(newUser);
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
