import { MigrationInterface, QueryRunner } from "typeorm";

export class addWhatsappLinkToClassesTable1649680669561 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('classes', 'whatsappLink')) {
            await queryRunner.query(`ALTER TABLE classes ADD whatsappLink VARCHAR(200) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE classes DROP COLUMN whatsappLink`);
    }

}
