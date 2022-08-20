import { MigrationInterface, QueryRunner } from "typeorm";

export class addZoomMeetingSyncStatusColumn1660761906994
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("classes", "sync_zoom_status"))) {
      await queryRunner.query(
        `ALTER table classes add sync_zoom_status TinyInt(1) DEFAULT 0`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("classes", "sync_zoom_status")) {
      await queryRunner.query(
        `ALTER TABLE classes DROP COLUMN sync_zoom_status`
      );
    }
  }
}
