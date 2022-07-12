import { MigrationInterface, QueryRunner } from "typeorm";

export class addSubscriptionTypeToInstallment1657632671895 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("installments", "subscription_type"))) {
            await queryRunner.query(
                `ALTER table installments add subscription_type varchar(100) NOT NULL DEFAULT 'Manual'`
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn("installments", "subscription_type")) {
            await queryRunner.query(
                `ALTER table installments add subscription_type varchar(100) NOT NULL DEFAULT 'Manual'`
            );
        }
    }

}
