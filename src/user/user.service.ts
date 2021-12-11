import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
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
        if (findUserByUsername) {
            throw new HttpException('Username are taken', HttpStatus.CONFLICT);
        }

        const findUserByEmail = await this.userRepository.findOne({
            email: dto.email,
        });
        if (findUserByEmail) {
            throw new HttpException('Email are taken', HttpStatus.CONFLICT);
        }

        const user = this.userRepository.create(dto);
        await this.userRepository.save(user);

        delete user.password;

        return user;
    }

    async login(dto: LoginUserDto) {
        const user = await this.userRepository.findOne(
            { email: dto.email },
            { select: ['username', 'password', 'email', 'bio', 'image'] },
        );
        if (!user) {
            throw new HttpException(
                'Email is not valid',
                HttpStatus.UNAUTHORIZED,
            );
        }

        const isPasswordCorrect = await compare(dto.password, user.password);
        if (!isPasswordCorrect) {
            throw new HttpException(
                'Password is not valid',
                HttpStatus.UNAUTHORIZED,
            );
        }

        delete user.password;

        return user;
    }

    async findById(id: number) {
        return await this.userRepository.findOne(id);
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
        if (user.id) delete user.id;
        return {
            user: {
                ...user,
                token: this.generateJWT(user),
            },
        };
    }
}
