import { ProfileType } from './types/profile.type';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { ProfileResponse } from './types/profileResponse.interface';
import { FollowEntity } from './follow.entity';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(FollowEntity)
        private readonly followRepository: Repository<FollowEntity>,
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

    async followProfile(
        currentUserId: number,
        profileUsername: string,
    ): Promise<ProfileType> {
        const findUser = await this.userRepository.findOne({
            username: profileUsername,
        });

        if (!findUser) {
            throw new HttpException(
                'Username is incorrect',
                HttpStatus.NOT_FOUND,
            );
        }
        if (currentUserId === findUser.id) {
            throw new HttpException(
                "User can't follow to himself",
                HttpStatus.BAD_REQUEST,
            );
        }

        const follow = await this.followRepository.findOne({
            followerId: currentUserId,
            followingId: findUser.id,
        });
        if (!follow) {
            const followToCreate = new FollowEntity();
            followToCreate.followerId = currentUserId;
            followToCreate.followingId = findUser.id;
            await this.followRepository.save(followToCreate);
        }

        return { ...findUser, following: true };
    }

    buildProfileResponse(profile: ProfileType): ProfileResponse {
        return { profile };
    }
}
