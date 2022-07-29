import { MigrationInterface, QueryRunner } from "typeorm";

export class addUseNewZoomLinkToClasses1658931447141
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("	classes", "useNewZoomLink"))) {
      await queryRunner.query(
        `ALTER TABLE classes ADD useNewZoomLink TINYINT DEFAULT 0`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE classes DROP COLUMN useNewZoomLink`);
  }
}
