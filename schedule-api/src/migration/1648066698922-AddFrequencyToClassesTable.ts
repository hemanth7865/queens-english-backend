import {MigrationInterface, QueryRunner} from "typeorm";

export class AddFrequencyToClassesTable1648066698922 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS frequency VARCHAR(45) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE classes DROP COLUMN IF EXISTS frequency`);
    }

}
