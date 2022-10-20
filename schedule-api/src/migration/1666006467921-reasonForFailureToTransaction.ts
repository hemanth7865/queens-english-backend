import { MigrationInterface, QueryRunner } from "typeorm";

export class reasonForFailureToTransaction1666006467921 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('installments', 'reason_for_failure')) {
            await queryRunner.query(`ALTER TABLE installments ADD reason_for_failure TEXT NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn('installments', 'reason_for_failure')) {
            await queryRunner.query(`ALTER TABLE installments DROP COLUMN reason_for_failure`);
        }
    }

}
