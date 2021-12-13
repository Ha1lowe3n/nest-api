import {
    Controller,
    Post,
    Body,
    HttpCode,
    Get,
    UseGuards,
    Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { IResponseUser } from './interfaces/response.interface';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../decorators/user.decorator';
import { UserEntity } from './entities/user.entity';
import { AuthGuard } from '../guards/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

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
    @UseGuards(AuthGuard)
    async getCurrentUser(@User() user: UserEntity): Promise<IResponseUser> {
        return this.userService.buildResponse(user);
    }

    @Patch('user')
    @UseGuards(AuthGuard)
    async update(
        @User('id') userId: number,
        @Body('user') dto: UpdateUserDto,
    ): Promise<IResponseUser> {
        const user = await this.userService.update(userId, dto);
        return this.userService.buildResponse(user);
    }
}
