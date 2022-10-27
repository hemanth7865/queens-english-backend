import { MigrationInterface, QueryRunner } from "typeorm";

export class addOfflineBatchToClassesTable1666812081501
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("classes", "offlineBatch"))) {
      await queryRunner.query(
        `ALTER TABLE classes ADD offlineBatch TINYINT(1) DEFAULT 0`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("classes", "offlineBatch")) {
      await queryRunner.query(`ALTER TABLE classes DROP COLUMN offlineBatch`);
    }
  }
}
