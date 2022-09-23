import { MigrationInterface, QueryRunner } from "typeorm";

export class addUserCodeToUsersTable1663885894766
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("user", "userCode"))) {
      await queryRunner.query(
        `ALTER TABLE user ADD userCode varchar(100) NULL UNIQUE`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("user", "userCode")) {
      await queryRunner.query(`ALTER TABLE user DROP COLUMN userCode`);
    }
  }
}
