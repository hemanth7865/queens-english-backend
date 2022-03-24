import {MigrationInterface, QueryRunner} from "typeorm";

export class AddZoomLinkToClassesTable1648117021188 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS zoom_link VARCHAR(200) NULL`);
        await queryRunner.query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS zoom_info VARCHAR(500) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE classes DROP COLUMN IF EXISTS zoom_link`);
        await queryRunner.query(`ALTER TABLE classes DROP COLUMN IF EXISTS zoom_info`);
    }

}
