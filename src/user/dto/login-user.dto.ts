import { IsNotEmpty, IsEmail, Length } from 'class-validator';

export class LoginUserDto {
    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    @Length(6, 30)
    readonly password: string;
}
