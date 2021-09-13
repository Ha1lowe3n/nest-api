import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteUniqueOptionFromUserEntity1631515830905
implements MigrationInterface
{
    name = 'DeleteUniqueOptionFromUserEntity1631515830905';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "public"."users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "public"."users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`,
        );
    }
}
