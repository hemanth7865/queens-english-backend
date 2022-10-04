import { MigrationInterface, QueryRunner } from "typeorm";

export class MIGRATIONNAME1664812852084 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("payment", "emiPaymentStatus"))) {
            await queryRunner.query(
                `ALTER table payment add emiPaymentStatus varchar(100) DEFAULT 'Pending'`
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE payment DROP COLUMN emiPaymentStatus`);
    }

}
