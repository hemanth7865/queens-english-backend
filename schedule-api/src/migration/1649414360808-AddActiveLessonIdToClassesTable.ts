import { MigrationInterface, QueryRunner } from "typeorm";

export class AddActiveLessonIdToClassesTable1649414360808 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('classes', 'activeLessonId')) {
            await queryRunner.query(`ALTER TABLE classes ADD activeLessonId VARCHAR(200) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('classes', 'activeLessonId')) {
            await queryRunner.query(`ALTER TABLE classes DROP activeLessonId`);
        }
    }

}
