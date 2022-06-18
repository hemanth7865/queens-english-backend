import { MigrationInterface, QueryRunner } from "typeorm";
export class addLastCheckedAtColumnToInstallmentsTable1655558620491
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("installments", "last_checked_at"))) {
      await queryRunner.query(
        `ALTER TABLE installments ADD last_checked_at datetime NULL`
      );
    }
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE installments DROP COLUMN last_checked_at`
    );
  }
}
