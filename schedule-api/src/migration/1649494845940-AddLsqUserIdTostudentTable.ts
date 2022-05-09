import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLsqUserIdTostudentTable1649494845940 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('student', 'lsq_users_ID')) {
            await queryRunner.query(`ALTER TABLE student ADD lsq_users_ID VARCHAR(200) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('student', 'lsq_users_ID')) {
            await queryRunner.query(`ALTER TABLE student DROP lsq_users_ID`);
        }
    }


}
