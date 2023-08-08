import { MigrationInterface, QueryRunner } from "typeorm";

export class creatingCSVDetailsTable1691490996903
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("csv_upload_details");
    if (!hasTable) {
      const query = `CREATE TABLE csv_upload_details (
                id VARCHAR(255) NOT NULL PRIMARY KEY,
                schoolId VARCHAR(255) NULL,
                fileName VARCHAR(255) NULL,
                errors TEXT NULL,
                uploadedBy VARCHAR(255) NULL,
                uploadedAt DATETIME NULL)`;
      await queryRunner.query(query);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
