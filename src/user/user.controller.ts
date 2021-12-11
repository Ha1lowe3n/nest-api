import { Controller, Post, Body, HttpCode, Get, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { IResponseUser } from './interfaces/response.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { ExpressRequest } from 'src/types/expressRequest.interface';
import { User } from './decorators/user.decorator';
import { UserEntity } from './entities/user.entity';

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('users')
    async create(@Body('user') dto: CreateUserDto): Promise<IResponseUser> {
        const user = await this.userService.create(dto);
        return this.userService.buildResponse(user);
    }

    @Post('users/login')
    @HttpCode(200)
    async login(@Body('user') dto: LoginUserDto) {
        const user = await this.userService.login(dto);
        return this.userService.buildResponse(user);
    }

    @Get('user')
    async getCurrentUser(@User() user: UserEntity): Promise<IResponseUser> {
        return this.userService.buildResponse(user);
    }
}
