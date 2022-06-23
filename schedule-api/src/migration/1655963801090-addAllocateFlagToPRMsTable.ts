import { MigrationInterface, QueryRunner } from "typeorm";

export class addAllocateFlagToPRMsTable1655963801090
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("prm", "allocate"))) {
      await queryRunner.query(
        `ALTER TABLE prm ADD allocate INT(1) NOT NULL DEFAULT '1'`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("prm", "allocate")) {
      await queryRunner.query(`ALTER TABLE prm DROP COLUMN allocate`);
    }
  }
}
