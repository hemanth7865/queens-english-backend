import { MigrationInterface, QueryRunner } from "typeorm";

export class addEnrollmentTypeToStudent1666022762900 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("student", "enrollmentType"))) {
            await queryRunner.query(
                `ALTER table student add enrollmentType varchar(100) DEFAULT NULL`
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE student DROP COLUMN enrollmentType`);
    }

}
