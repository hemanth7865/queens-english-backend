import { MigrationInterface, QueryRunner } from "typeorm";

export class addEnrollmentTypeToLQSEntry1666019844413 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("lsqentry", "enrollmentType"))) {
            await queryRunner.query(
                `ALTER table lsqentry add enrollmentType varchar(100) DEFAULT NULL`
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE lsqentry DROP COLUMN enrollmentType`);
    }

}
