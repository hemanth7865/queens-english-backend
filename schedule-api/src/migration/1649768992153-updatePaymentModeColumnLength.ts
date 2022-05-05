import { MigrationInterface, QueryRunner } from "typeorm";

export class updatePaymentModeColumnLength1649768992153 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE payment MODIFY paymentMode TEXT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
