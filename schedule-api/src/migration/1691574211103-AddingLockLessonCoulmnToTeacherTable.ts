import {MigrationInterface, QueryRunner} from "typeorm";

export class AddingLockLessonCoulmnToTeacherTable1691574211103 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasLockLessonColumn = await queryRunner.hasColumn("teacher", "lockLesson");
        if (!hasLockLessonColumn) {
            await queryRunner.query(`ALTER TABLE teacher ADD COLUMN lockLesson BOOLEAN DEFAULT false`);
        }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasLockLessonColumn = await queryRunner.hasColumn("teacher", "lockLesson");
        if (hasLockLessonColumn) {
            await queryRunner.query(`ALTER TABLE teacher DROP COLUMN lockLesson`);
        }
    }

}
