import { MigrationInterface, QueryRunner } from "typeorm";

export class phoneNumberFieldIssueFixInUserTable1713428198619
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE user MODIFY COLUMN phoneNumber VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
