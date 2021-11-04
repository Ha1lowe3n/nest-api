import { Controller, Get, Param } from '@nestjs/common';
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
}
