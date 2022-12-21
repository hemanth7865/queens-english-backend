import { MigrationInterface, QueryRunner } from "typeorm";

export class addSchoolColumntoUser1670423644879 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("user", "schoolId"))) {
            await queryRunner.query("ALTER TABLE user ADD schoolId varchar(255);");
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("user", "schoolId"))) {
            await queryRunner.query("ALTER TABLE user ADD schoolId varchar(255);");
        }
    }

}
