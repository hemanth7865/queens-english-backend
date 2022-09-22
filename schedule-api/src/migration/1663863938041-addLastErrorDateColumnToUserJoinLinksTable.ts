import { MigrationInterface, QueryRunner } from "typeorm";

export class addLastErrorDateColumnToUserJoinLinksTable1663863938041
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      !(await queryRunner.hasColumn(
        "users_join_links",
        "last_daily_exhausted_error"
      ))
    ) {
      await queryRunner.query(
        `ALTER TABLE users_join_links ADD last_daily_exhausted_error DATE NULL`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (
      await queryRunner.hasColumn(
        "users_join_links",
        "last_daily_exhausted_error"
      )
    ) {
      await queryRunner.query(
        `ALTER TABLE users_join_links DROP COLUMN last_daily_exhausted_error`
      );
    }
  }
}
