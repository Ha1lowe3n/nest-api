import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1635497279084 implements MigrationInterface {
    name = 'SeedDb1635497279084';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO tags (name) VALUES ('dragons'), ('coffee'), ('nestjs')`,
        );

        // password is 123
        await queryRunner.query(
            `INSERT INTO users (username, email, password) VALUES ('foo', 'foo@mail.ru', '$2b$10$4/ePJzMc9CtTviB/yxgy3OVwH1YZ0xOcuH.younQcf60dqOIgmkMy')`,
        );

        await queryRunner.query(
            `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'First article', 'first article description', 'first article body', 'coffee,dragons', 1)`,
        );
        await queryRunner.query(
            `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('second-article', 'Second article', 'second article description', 'second article body', 'coffee,dragons,nestjs', 1)`,
        );
    }

    public async down(): Promise<void> {}
}
