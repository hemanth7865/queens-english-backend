import { MigrationInterface, QueryRunner } from "typeorm";

export class cyclesToTransactions1658931109261 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("installments", "cycles"))) {
            await queryRunner.query(
                `ALTER table installments add cycles INTEGER NULL`
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn("installments", "cycles")) {
            await queryRunner.query(
                `ALTER table installments add cycles INTEGER NULL`
            );
        }
    }

}
