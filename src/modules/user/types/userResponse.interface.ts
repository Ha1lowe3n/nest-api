import { UserEntity } from '../user.entity';

export interface UserResponse {
    user: Omit<UserEntity, 'hashPassword'> & { token: string };
}
