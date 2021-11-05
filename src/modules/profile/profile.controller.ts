import {
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { User } from 'src/shared/decorators/user.decorator';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { ProfileService } from './profile.service';
import { ProfileResponse } from './types/profileResponse.interface';

@Controller('profiles')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get(':username')
    @UseGuards(AuthGuard)
    async getProfile(
        @User('id') currentUserId: number,
        @Param('username') username: string,
    ): Promise<ProfileResponse> {
        const profile = await this.profileService.getProfile(
            username,
            currentUserId,
        );
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

    @Delete(':username/follow')
    @UseGuards(AuthGuard)
    async deleteProfile(
        @User('id') currentUserId: number,
        @Param('username') profileUsername: string,
    ): Promise<ProfileResponse> {
        const profile = await this.profileService.unfollowProfile(
            currentUserId,
            profileUsername,
        );
        return this.profileService.buildProfileResponse(profile);
    }
}
