import { JwtPayload } from 'jsonwebtoken';

export type DecodeType = {
    id: number;
    username: string;
    password: string;
    iat: JwtPayload['iat'];
};
