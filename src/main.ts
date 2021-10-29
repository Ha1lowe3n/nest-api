import { NestFactory } from '@nestjs/core';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(process.env.PORT);
}
bootstrap();
