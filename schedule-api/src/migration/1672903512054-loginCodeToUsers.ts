import {MigrationInterface, QueryRunner} from "typeorm";

export class loginCodeToUsers1672903512054 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("user", "loginCode"))) {
            await queryRunner.query(`ALTER TABLE user ADD loginCode VARCHAR(100) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn("user", "loginCode")) {
            await queryRunner.query(`ALTER TABLE user DROP COLUMN loginCode`);
        }
    }

}
