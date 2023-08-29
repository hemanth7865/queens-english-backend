import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingLockLessonCoulmnToSchoolTable1691519390534
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasLockLessonColumn = await queryRunner.hasColumn(
      "school",
      "lockLesson"
    );
    if (!hasLockLessonColumn) {
      await queryRunner.query(
        `ALTER TABLE school ADD COLUMN lockLesson boolean DEFAULT false`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasLockLessonColumn = await queryRunner.hasColumn(
      "school",
      "lockLesson"
    );
    if (hasLockLessonColumn) {
      await queryRunner.query(`ALTER TABLE school DROP COLUMN lockLesson`);
    }
  }
}
