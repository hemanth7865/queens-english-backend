import {MigrationInterface, QueryRunner} from "typeorm";

export class netbankingLink1655190303967 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('installments', 'netbank_ref_link')) {
            await queryRunner.query(`ALTER TABLE installments ADD netbank_ref_link VARCHAR(255) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn('installments', 'netbank_ref_link')) {
            await queryRunner.query(`ALTER TABLE installments DROP COLUMN netbank_ref_link`);
        }
    }

}
