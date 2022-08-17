import { MigrationInterface, QueryRunner } from "typeorm";

export class addZoomMeetingSyncStatusColumn1660761906994
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("zoom_meetings", "sync_status"))) {
      await queryRunner.query(
        `ALTER table zoom_meetings add sync_status TinyInt(1) DEFAULT 0`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("zoom_meetings", "sync_status")) {
      await queryRunner.query(
        `ALTER TABLE zoom_meetings DROP COLUMN sync_status`
      );
    }
  }
}
