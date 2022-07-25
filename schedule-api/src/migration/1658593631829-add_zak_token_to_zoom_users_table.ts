import { MigrationInterface, QueryRunner } from "typeorm";

export class addZakTokenToZoomUsersTable1658593631829
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("	zoom_users", "zak_token"))) {
      await queryRunner.query(`ALTER TABLE zoom_users ADD zak_token TEXT NULL`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE zoom_users DROP COLUMN zak_token`);
  }
}
