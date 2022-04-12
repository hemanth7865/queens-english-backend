import {MigrationInterface, QueryRunner} from "typeorm";

export class updatePaymentEMIColumnLength1649799522878 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE payment MODIFY emi TEXT NULL`);
        await queryRunner.query(`ALTER TABLE payment MODIFY emiMonths TEXT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
