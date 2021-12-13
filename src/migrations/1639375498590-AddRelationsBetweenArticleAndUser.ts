import {MigrationInterface, QueryRunner} from "typeorm";

export class AddRelationsBetweenArticleAndUser1639375498590 implements MigrationInterface {
    name = 'AddRelationsBetweenArticleAndUser1639375498590'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."articles" ADD "authorId" integer`);
        await queryRunner.query(`ALTER TABLE "public"."articles" ALTER COLUMN "tagList" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."articles" DROP COLUMN "favoritesCount"`);
        await queryRunner.query(`ALTER TABLE "public"."articles" ADD "favoritesCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "public"."articles" ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."articles" DROP CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34"`);
        await queryRunner.query(`ALTER TABLE "public"."articles" DROP COLUMN "favoritesCount"`);
        await queryRunner.query(`ALTER TABLE "public"."articles" ADD "favoritesCount" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."articles" ALTER COLUMN "tagList" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."articles" DROP COLUMN "authorId"`);
    }

}
