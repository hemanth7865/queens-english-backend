import { MigrationInterface, QueryRunner } from "typeorm";

export class addTeacherCodeToClassesTable1659050165050
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("classes", "teacherCode"))) {
      await queryRunner.query(
        `ALTER table classes add teacherCode varchar(100) NULL`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE classes DROP COLUMN teacherCode`);
  }
}
