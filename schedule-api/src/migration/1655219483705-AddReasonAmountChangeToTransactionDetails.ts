import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReasonAmountChangeToTransactionDetails1655219483705 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('transaction_details', 'reason_amount_change')) {
            await queryRunner.query(`ALTER TABLE transaction_details ADD reason_amount_change VARCHAR(200) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE transaction_details DROP COLUMN reason_amount_change`);
    }

}
