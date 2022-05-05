import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTeacherNameTolsqentryTable1649150584417 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('lsqentry', 'teacherName')) {
            await queryRunner.query(`ALTER TABLE lsqentry ADD teacherName VARCHAR(200) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE lsqentry DROP teacherName`);
    }

}
