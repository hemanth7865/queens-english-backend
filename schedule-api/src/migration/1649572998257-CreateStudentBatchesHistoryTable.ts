import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStudentBatchesHistoryTable1649572998257 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasTable('student_batches_history')) {
            await queryRunner.query(`
            CREATE TABLE student_batches_history (
                id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                studentId VARCHAR(200) NOT NULL,
                batchId VARCHAR(200) NOT NULL,
                active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable('student_batches_history')) {
            await queryRunner.query(`DROP TABLE student_batches_history`);
        }
    }

}
