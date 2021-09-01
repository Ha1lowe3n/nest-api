import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUsernameToUsers1630452351949 implements MigrationInterface {
    name = 'AddUsernameToUsers1630452351949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" ADD "username" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "public"."users" DROP COLUMN "username"`);
    }

}
