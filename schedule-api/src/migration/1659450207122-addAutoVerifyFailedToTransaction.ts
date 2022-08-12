import { MigrationInterface, QueryRunner } from "typeorm";

export class addAutoVerifyFailedToTransaction1659450207122 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("installments", "auto_retry_failed"))) {
            await queryRunner.query(
                `ALTER table installments add auto_retry_failed TinyInt(1) DEFAULT 0`
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn("installments", "auto_retry_failed")) {
            await queryRunner.query(
                `ALTER TABLE installments DROP COLUMN auto_retry_failed`
            );
        }
    }

}
