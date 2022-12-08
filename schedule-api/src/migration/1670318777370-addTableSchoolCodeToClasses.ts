import { MigrationInterface, QueryRunner } from "typeorm";

export class addTableSchoolCodeToClasses1670318777370 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("classes", "schoolId"))) {
            await queryRunner.query("ALTER TABLE classes ADD schoolId VARCHAR(255);");
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("classes", "schoolId"))) {
            await queryRunner.query("ALTER TABLE classes ADD schoolId VARCHAR(255);");
            //await queryRunner.query("ALTER TABLE classes DROP schoolId;");
        }
    }

}
