import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateTagDto {
    @IsNotEmpty()
    @Length(3, 20)
    @IsString()
    readonly title: string;
}
