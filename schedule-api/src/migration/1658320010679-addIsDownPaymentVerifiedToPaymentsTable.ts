import { MigrationInterface, QueryRunner } from "typeorm";

export class addIsDownPaymentVerifiedToPaymentsTable1658320010679
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("payment", "is_down_paymnet_verified"))) {
      await queryRunner.query(
        `ALTER table payment add is_down_paymnet_verified TinyInt(1) DEFAULT 0`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn("payment", "is_down_paymnet_verified")) {
      await queryRunner.query(
        `ALTER TABLE payment DROP COLUMN is_down_paymnet_verified`
      );
    }
  }
}
