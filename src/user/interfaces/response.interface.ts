import { UserEntity } from '../entities/user.entity';

export interface IResponseUser {
    user: Omit<UserEntity, 'hashPassword'> & { token: string };
}
