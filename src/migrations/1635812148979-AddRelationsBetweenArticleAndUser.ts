import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationsBetweenArticleAndUser1635812148979
    implements MigrationInterface
{
    name = 'AddRelationsBetweenArticleAndUser1635812148979';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "public"."articles" ADD "authorId" integer`,
        );
        await queryRunner.query(
            `ALTER TABLE "public"."users" ALTER COLUMN "password" DROP DEFAULT`,
        );
        await queryRunner.query(
            `ALTER TABLE "public"."articles" ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "public"."articles" DROP CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34"`,
        );
        await queryRunner.query(
            `ALTER TABLE "public"."users" ALTER COLUMN "password" SET DEFAULT ''`,
        );
        await queryRunner.query(
            `ALTER TABLE "public"."articles" DROP COLUMN "authorId"`,
        );
    }
}
