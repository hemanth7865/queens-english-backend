import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotesToTransaction1654859372312 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('transaction_details', 'notes')) {
            await queryRunner.query(`ALTER TABLE transaction_details ADD notes VARCHAR(200) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE transaction_details DROP COLUMN notes`);
    }

}
