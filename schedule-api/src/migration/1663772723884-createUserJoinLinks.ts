import { MigrationInterface, QueryRunner } from "typeorm";

export class createUserJoinLinks1663772723884 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable("users_zoom_links"))) {
      await queryRunner.query(
        "CREATE TABLE `users_zoom_links` (`id` VARCHAR(200) NOT NULL, `registrant_id` VARCHAR(200) NOT NULL, `meeting_id` VARCHAR(200) NOT NULL, `join_url` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci, `email` VARCHAR(200) CHARACTER SET utf8 COLLATE utf8_general_ci, `batch_id` VARCHAR(200) CHARACTER SET utf8 COLLATE utf8_general_ci, `created_at` DATETIME ,`updated_at` DATETIME, PRIMARY KEY (`id`,`registrant_id`));"
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable("users_zoom_links"))) {
      await queryRunner.query("DROP TABLE `users_zoom_links`");
    }
  }
}
