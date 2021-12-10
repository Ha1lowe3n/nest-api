import { Request } from 'express';
import { UserEntity } from 'src/user/entities/user.entity';

export interface ExpressRequest extends Request {
    user?: UserEntity;
}
