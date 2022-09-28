import { MigrationInterface, QueryRunner } from "typeorm";

export class addUseNewAttendanceColumnToClassesTable1664367942433
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("classes", "useAutoAttendance"))) {
      await queryRunner.query(
        `ALTER TABLE classes ADD useAutoAttendance TINYINT(1) NOT NULL DEFAULT 0`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("classes", "useAutoAttendance")) {
      await queryRunner.query(
        `ALTER TABLE classes DROP COLUMN useAutoAttendance`
      );
    }
  }
}
