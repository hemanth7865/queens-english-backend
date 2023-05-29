import { MigrationInterface, QueryRunner } from "typeorm";

export class addingPasswordFieldToStudentTable1684646290462
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("student", "password"))) {
      await queryRunner.query(`ALTER TABLE student ADD password TEXT;`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("student", "password")) {
      await queryRunner.query(`ALTER TABLE student DROP COLUMN password`);
    }
  }
}
