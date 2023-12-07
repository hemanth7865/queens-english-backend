import { MigrationInterface, QueryRunner } from "typeorm";

export class increasingUserIdLength1701250805107 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("user", "id")) {
      const query = `ALTER TABLE user MODIFY id VARCHAR(50)`;
      await queryRunner.query(query);
    }
    if (await queryRunner.hasColumn("student", "id")) {
      const query = `ALTER TABLE student MODIFY id VARCHAR(50)`;
      await queryRunner.query(query);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
