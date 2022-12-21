import { MigrationInterface, QueryRunner } from "typeorm";

export class schoolNameInClasses1670702902194 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("classes", "schoolName"))) {
            await queryRunner.query("ALTER TABLE classes ADD schoolName VARCHAR(255);");
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if ((await queryRunner.hasColumn("classes", "schoolName"))) {
            await queryRunner.query("ALTER TABLE classes ADD schoolName VARCHAR(255);");
        }
    }

}
