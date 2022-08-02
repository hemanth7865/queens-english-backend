import { MigrationInterface, QueryRunner } from "typeorm";

export class subscriptionstatusToTransactions1658930824711 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("installments", "subscription_status"))) {
            await queryRunner.query(
                `ALTER table installments add subscription_status varchar(100) NULL`
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn("installments", "subscription_status")) {
            await queryRunner.query(
                `ALTER table installments add subscription_status varchar(100) NULL`
            );
        }
    }

}
