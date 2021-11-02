import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';

import { User } from '../decorators/user.decorator';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { UserResponse } from './types/userResponse.interface';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UpdateGuard } from './guards/update.guard';

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('users')
    @UsePipes(new ValidationPipe())
    async createUser(
        @Body('user') createUserDto: CreateUserDto,
    ): Promise<UserResponse> {
        const user = await this.userService.createUser(createUserDto);
        return this.userService.buildUserResponse(user);
    }

    @Post('users/login')
    @UsePipes(new ValidationPipe())
    async loginUser(
        @Body('user') loginUserDto: LoginUserDto,
    ): Promise<UserResponse> {
        const user = await this.userService.loginUser(loginUserDto);
        return this.userService.buildUserResponse(user);
    }

    @Get('user')
    @UseGuards(AuthGuard)
    async currentUser(@User() user: UserEntity): Promise<UserResponse> {
        return this.userService.buildUserResponse(user);
    }

    @Put('user')
    @UseGuards(AuthGuard, UpdateGuard)
    @UsePipes(new ValidationPipe())
    async updateUser(
        @User('id') currentUserId: number,
        @Body('user') updateUserDto: UpdateUserDto,
    ): Promise<UserResponse> {
        const updateUser = await this.userService.updateUser(
            currentUserId,
            updateUserDto,
        );
        return this.userService.buildUserResponse(updateUser);
    }
}
