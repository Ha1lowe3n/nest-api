import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { sign } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { IResponseUser } from './interfaces/response.interface';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async create(dto: CreateUserDto): Promise<UserEntity> {
        const findUserByUsername = await this.userRepository.findOne({
            username: dto.username,
        });
        const findUserByEmail = await this.userRepository.findOne({
            email: dto.email,
        });

        if (findUserByUsername) {
            throw new HttpException('Username are taken', HttpStatus.CONFLICT);
        }
        if (findUserByEmail) {
            throw new HttpException('Email are taken', HttpStatus.CONFLICT);
        }

        const user = this.userRepository.create(dto);
        await this.userRepository.save(user);

        delete user.password;

        console.log(user);

        return user;
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

    buildResponse(user: UserEntity): IResponseUser {
        console.log(UserEntity);

        return {
            user: {
                ...user,
                token: this.generateJWT(user),
            },
        };
    }
}
