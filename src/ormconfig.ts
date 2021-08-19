import { ConnectionOptions } from 'typeorm';

export const ormConfig: ConnectionOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'nest-api',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
};
