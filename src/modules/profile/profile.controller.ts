import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { ProfileService } from './profile.service';
import { ProfileResponse } from './types/profileResponse.interface';

@Controller('profiles')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get(':username')
    async getProfile(
        @Param('username') username: string,
    ): Promise<ProfileResponse> {
        const profile = await this.profileService.getProfile(username);
        return this.profileService.buildProfileResponse(profile);
    }

    @Post(':username/follow')
    @UseGuards(AuthGuard)
    async followProfile(
        @User('id') currentUserId: number,
        @Param('username') profileUsername: string,
    ): Promise<ProfileResponse> {
        const profile = await this.profileService.followProfile(
            currentUserId,
            profileUsername,
        );
        return this.profileService.buildProfileResponse(profile);
    }
}
