import {MigrationInterface, QueryRunner} from "typeorm";

export class existingStudents1657523106259 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('student', 'prevBathcedStudent')) {
            await queryRunner.query(`ALTER TABLE student ADD prevBathcedStudent BOOLEAN NOT NULL DEFAULT false`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('student', 'prevBathcedStudent')) {
            await queryRunner.query(`ALTER TABLE student ADD prevBathcedStudent BOOLEAN NOT NULL DEFAULT false`);
        }
    }

}