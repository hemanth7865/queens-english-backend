import { MigrationInterface, QueryRunner } from "typeorm";

export class ForceRazorpayMoveSAV1663862437744 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("payment", "forceRazorpayMoveSAV"))) {
            await queryRunner.query(
                `ALTER table payment add forceRazorpayMoveSAV TinyInt(1) DEFAULT 0`
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn("payment", "forceRazorpayMoveSAV")) {
            await queryRunner.query(
                `ALTER TABLE payment DROP COLUMN forceRazorpayMoveSAV`
            );
        }
    }

}
