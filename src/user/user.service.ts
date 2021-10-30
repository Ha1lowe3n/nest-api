import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';

import { CreateUserDto } from './dto/createUser.dto';
import { UserEntity } from './user.entity';
import { UserResponse } from './types/userResponse.interface';

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
                'Username are taken',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        const newUser = new UserEntity();
        Object.assign(newUser, createUserDto);
        console.log(newUser);

        return this.userRepository.save(newUser);
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
