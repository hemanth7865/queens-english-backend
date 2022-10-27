import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPreventAppAccessAndLocalStudentCodeForUsersTable1666615103093
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("user", "offlineStudentCode"))) {
      await queryRunner.query(
        `ALTER TABLE user ADD offlineStudentCode VARCHAR(100) NULL`
      );
    }

    if (!(await queryRunner.hasColumn("user", "preventAppAccess"))) {
      await queryRunner.query(
        `ALTER TABLE user ADD preventAppAccess TINYINT(1) DEFAULT 0`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("user", "offlineStudentCode")) {
      await queryRunner.query(
        `ALTER TABLE user DROP COLUMN offlineStudentCode`
      );
    }

    if (await queryRunner.hasColumn("user", "preventAppAccess")) {
      await queryRunner.query(`ALTER TABLE user DROP COLUMN preventAppAccess`);
    }
  }
}
