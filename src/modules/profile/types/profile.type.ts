import { UserEntity } from 'src/modules/user/user.entity';

export type ProfileType = Omit<UserEntity, 'email' | 'hashPassword'> & {
    following: boolean;
};
