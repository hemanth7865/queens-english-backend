import {MigrationInterface, QueryRunner} from "typeorm";

export class collectionAgent1654760619515 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasTable('collection_agent')) {
            await queryRunner.query(`
            CREATE TABLE collection_agent (
                id int NOT NULL AUTO_INCREMENT,
                firstName text NOT NULL,
                lastName text NOT NULL,
                gender varchar(255) DEFAULT NULL,
                phoneNumber varchar(255) DEFAULT NULL,
                alternativeMobile varchar(255) DEFAULT NULL,
                email text NOT NULL,
                PRIMARY KEY (id)
              );

            `);
        }
        if (await queryRunner.hasColumn('installments', 'transaction_id')) {
            await queryRunner.query(`ALTER TABLE installments rename column transaction_id to reference_id`);
        }
        if (!(await queryRunner.hasColumn("installments", "payment_link"))) {
          await queryRunner.query(
            `ALTER TABLE installments ADD payment_link varchar(255)`
          );
        }
        if (await queryRunner.hasColumn('transaction_details', 'status')) {
            await queryRunner.query(`ALTER TABLE transaction_details DROP COLUMN status`);
        }
        if (await queryRunner.hasColumn('transaction_details', 'mode_of_payment')) {
            await queryRunner.query(`ALTER TABLE transaction_details DROP COLUMN mode_of_payment`);
        }
        if (await queryRunner.hasColumn('transaction_details', 'razorpay_link')) {
            await queryRunner.query(`ALTER TABLE  transaction_details DROP column razorpay_link`);
        }
        if (await queryRunner.hasTable("installments")) {
          await queryRunner.query(
            `ALTER TABLE installments RENAME TO installments`
          );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable('collection_agent')) {
            await queryRunner.query(`DROP TABLE collection_agent`);
        }
    }
}