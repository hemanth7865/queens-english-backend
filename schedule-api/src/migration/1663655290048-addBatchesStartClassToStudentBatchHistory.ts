import { MigrationInterface, QueryRunner } from "typeorm";

export class addBatchesStartClassToStudentBatchHistory1663655290048 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('student_batches_history', 'batchesClassesStartDate')) {
            await queryRunner.query(`ALTER TABLE student_batches_history ADD batchesClassesStartDate DATE NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE student_batches_history DROP COLUMN batchesClassesStartDate`);
    }

}
