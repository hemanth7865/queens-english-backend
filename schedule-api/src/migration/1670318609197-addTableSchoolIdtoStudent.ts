import { MigrationInterface, QueryRunner } from "typeorm";

export class addTableSchoolIdtoStudent1670318609197 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("student", "schoolId"))) {
            await queryRunner.query("ALTER TABLE student ADD schoolId VARCHAR(255);");
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("student", "schoolId"))) {
            await queryRunner.query("ALTER TABLE student ADD schoolId VARCHAR(255);");
            //await queryRunner.query("ALTER TABLE student DROP schoolId;");
        }
    }

}
