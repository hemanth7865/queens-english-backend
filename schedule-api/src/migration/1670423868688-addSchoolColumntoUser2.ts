import { MigrationInterface, QueryRunner } from "typeorm";

export class addSchoolColumntoUser21670423868688 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("user", "schoolCode"))) {
            await queryRunner.query("ALTER TABLE user ADD schoolCode varchar(255);");
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("user", "schoolCode"))) {
            await queryRunner.query("ALTER TABLE user ADD schoolCode varchar(255);");
        }
    }

}
