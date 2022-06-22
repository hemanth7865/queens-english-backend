import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateZoomUsersTable1655897139569 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable("zoom_users"))) {
      await queryRunner.query(`CREATE TABLE \`zoom_users\` (
            \`id\` VARCHAR(200) unsigned NOT NULL,
            \`first_name\` VARCHAR(200) CHARACTER SET utf8 COLLATE utf8_general_ci,
            \`last_name\` VARCHAR(200) CHARACTER SET utf8 COLLATE utf8_general_ci,
            \`email\` VARCHAR(200) CHARACTER SET utf8 COLLATE utf8_general_ci,
            \`type\` INT(7) DEFAULT '2',
            \`user_id\` VARCHAR(200) CHARACTER SET utf8 COLLATE utf8_general_ci,
            PRIMARY KEY (\`id\`,\`email\`,\`user_id\`)
        );`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable("zoom_users"))) {
      await queryRunner.query(`DROP TABLE \`zoom_users\``);
    }
  }
}
