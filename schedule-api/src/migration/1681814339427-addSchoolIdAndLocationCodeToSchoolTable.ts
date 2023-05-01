import { MigrationInterface, QueryRunner } from "typeorm";

export class addSchoolIdAndLocationCodeToSchoolTable1681814339427
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("school", "schoolId"))) {
      await queryRunner.query(`ALTER TABLE school ADD schoolId varchar(10);`);
    }
    if (!(await queryRunner.hasColumn("school", "locationCode"))) {
      await queryRunner.query(
        `ALTER TABLE school ADD locationCode varchar(10);`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("school", "schoolId")) {
      await queryRunner.query(`ALTER TABLE school DROP COLUMN schoolId`);
    }

    if (await queryRunner.hasColumn("school", "locationCode")) {
      await queryRunner.query(`ALTER TABLE school DROP COLUMN locationCode`);
    }
  }
}
