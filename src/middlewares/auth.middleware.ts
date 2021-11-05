import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { UserService } from 'src/modules/user/user.service';

import { DecodeType } from 'src/shared/types/decode.type';
import { ExpressRequest } from 'src/shared/types/expressRequest.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly userService: UserService) {}

    async use(req: ExpressRequest, res: Response, next: NextFunction) {
        if (!req.headers.authorization) {
            req.user = null;
            next();
            return;
        }

        const token = req.headers.authorization.split(' ')[1];

        try {
            const decode = verify(token, process.env.JWT_SECRET) as DecodeType;
            const user = await this.userService.findById(decode.id);
            req.user = user;
            next();
        } catch (error) {
            req.user = null;
            next();
        }
    }
}
