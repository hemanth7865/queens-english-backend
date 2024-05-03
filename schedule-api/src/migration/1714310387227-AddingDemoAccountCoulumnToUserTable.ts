import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddingDemoAccountCoulumnToUserTable1714310387227
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "user",
      new TableColumn({
        name: "demoAccount",
        type: "boolean",
        default: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("user", "demoAccount");
  }
}
