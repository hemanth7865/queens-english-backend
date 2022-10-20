import { MigrationInterface, QueryRunner } from "typeorm";

export class addDateOfInactivationToStudentTable1666246162654 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("student", "dateOfInactivation"))) {
            await queryRunner.query(
                `ALTER TABLE student ADD dateOfInactivation DATE NULL`
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn("student", "dateOfInactivation")) {
            await queryRunner.query(`ALTER TABLE student DROP COLUMN dateOfInactivation`);
        }
    }

}
