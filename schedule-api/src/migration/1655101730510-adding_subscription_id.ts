import {MigrationInterface, QueryRunner} from "typeorm";

export class addingSubscriptionId1655101730510 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('installments', 'subscription_id')) {
            await queryRunner.query(`ALTER TABLE installments ADD subscription_id VARCHAR(255) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn('installments', 'subscription_id')) {
            await queryRunner.query(`ALTER TABLE installments DROP COLUMN subscription_id`);
        }
    }

}
