import {
    ArrayNotEmpty,
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateArticleDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    body: string;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    tagList?: string[];
}
