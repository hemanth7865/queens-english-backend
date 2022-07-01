import { MigrationInterface, QueryRunner } from "typeorm";

export class addEarlyBirdAndExpiredByColumnsToInstallments1656697753306
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("installments", "early_bird"))) {
      await queryRunner.query(
        `ALTER TABLE installments ADD early_bird FLOAT NOT NULL`
      );
    }

    if (!(await queryRunner.hasColumn("installments", "expire_by"))) {
      await queryRunner.query(
        `ALTER TABLE installments ADD expire_by DATETIME NULL`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("installments", "early_bird")) {
      await queryRunner.query(
        `ALTER TABLE installments DROP COLUMN early_bird`
      );
    }

    if (await queryRunner.hasColumn("installments", "expire_by")) {
      await queryRunner.query(
        `ALTER TABLE installments DROP COLUMN early_bird`
      );
    }
  }
}
