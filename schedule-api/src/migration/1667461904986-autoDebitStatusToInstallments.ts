import { MigrationInterface, QueryRunner } from "typeorm";

export class autoDebitStatusToInstallments1667461904986 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('installments', 'autodebit_status')) {
            await queryRunner.query(`ALTER TABLE installments ADD autodebit_status VARCHAR(45) NOT NULL DEFAULT 'successfullADInstallment'`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE installments DROP COLUMN autodebit_status`);
    }

}
