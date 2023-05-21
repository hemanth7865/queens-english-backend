import { MigrationInterface, QueryRunner } from "typeorm";

export class addMiddleNameAndClassSectionFieldToStudentTable1683801075449
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("user", "middleName"))) {
      await queryRunner.query(`ALTER TABLE user ADD middleName TEXT;`);
    }
    if (!(await queryRunner.hasColumn("student", "classSection"))) {
      await queryRunner.query(`ALTER TABLE student ADD classSection TEXT;`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("user", "middleName")) {
      await queryRunner.query(`ALTER TABLE user DROP COLUMN middleName`);
    }

    if (await queryRunner.hasColumn("student", "classSection")) {
      await queryRunner.query(`ALTER TABLE student DROP COLUMN classSection`);
    }
  }
}
