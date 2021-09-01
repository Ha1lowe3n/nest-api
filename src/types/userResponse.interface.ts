import { UserEntity } from '../user/user.entity';

export interface UserResponseInterface {
    user: Omit<UserEntity, 'hashPassword'> & { token: string };
}
