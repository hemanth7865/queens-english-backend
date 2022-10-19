import { MigrationInterface, QueryRunner } from "typeorm";

export class installmentTypeToTransactionTable1665668039367 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("installments", "installment_type"))) {
            await queryRunner.query(
                `ALTER table installments add installment_type varchar(100) NULL`
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE installments DROP COLUMN installment_type`);
    }

}
