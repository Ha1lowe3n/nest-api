import { ProfileType } from './types/profile.type';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { ProfileResponse } from './types/profileResponse.interface';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async getProfile(username: string): Promise<ProfileType> {
        const findUser = await this.userRepository.findOne({ username });

        if (!findUser) {
            throw new HttpException(
                'Username is incorrect',
                HttpStatus.NOT_FOUND,
            );
        }

        delete findUser.email;

        return { ...findUser, following: false };
    }

    buildProfileResponse(profile: ProfileType): ProfileResponse {
        return { profile };
    }
}
