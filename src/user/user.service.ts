import { Injectable } from '@nestjs/common';
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
