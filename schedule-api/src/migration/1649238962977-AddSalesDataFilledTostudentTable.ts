import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSalesDataFilledTostudentTable1649238962977 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('student', 'salesDataFilled')) {
            await queryRunner.query(`ALTER TABLE student ADD salesDataFilled VARCHAR(200) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('student', 'salesDataFilled')) {
            await queryRunner.query(`ALTER TABLE student DROP salesDataFilled`);
        }
    }

}
