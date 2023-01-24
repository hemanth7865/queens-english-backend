import { MigrationInterface, QueryRunner } from "typeorm";

export class addOfflineStudentFlagToUsersTable1672996555152
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("user", "offlineUser"))) {
      await queryRunner.query(
        "ALTER TABLE user ADD offlineUser TINYINT(1) DEFAULT 0;"
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("user", "offlineUser")) {
      await queryRunner.query(`ALTER TABLE user DROP COLUMN offlineUser`);
    }
  }
}
