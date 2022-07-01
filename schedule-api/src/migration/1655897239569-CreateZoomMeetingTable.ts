import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateZoomMeetingTable1655897239569 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable("zoom_meetings"))) {
      await queryRunner.query(
        "CREATE TABLE `zoom_meetings` (`id` VARCHAR(200) NOT NULL, `uuid` VARCHAR(200) NOT NULL, `start_url` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci, `meeting` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci, `join_url` VARCHAR(200) CHARACTER SET utf8 COLLATE utf8_general_ci, `password` VARCHAR(200) CHARACTER SET utf8 COLLATE utf8_general_ci, `host_id` VARCHAR(200) CHARACTER SET utf8 COLLATE utf8_general_ci, `user_id` VARCHAR(200) CHARACTER SET utf8 COLLATE utf8_general_ci, `batch_id` VARCHAR(200) CHARACTER SET utf8 COLLATE utf8_general_ci, `created_at` DATETIME ,`updated_at` DATETIME, PRIMARY KEY (`id`,`batch_id`));"
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable("zoom_meetings"))) {
      await queryRunner.query("DROP TABLE `zoom_meetings`");
    }
  }
}
