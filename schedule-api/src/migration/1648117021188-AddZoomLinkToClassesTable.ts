import {MigrationInterface, QueryRunner} from "typeorm";

export class AddZoomLinkToClassesTable1648117021188 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('classes', 'zoomLink')) { 
            await queryRunner.query(`ALTER TABLE classes ADD zoomLink VARCHAR(200) NULL`);
        }
        if (!await queryRunner.hasColumn('classes', 'zoomInfo')) { 
            await queryRunner.query(`ALTER TABLE classes ADD zoomInfo VARCHAR(500) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE classes DROP COLUMN zoomLink`);
        await queryRunner.query(`ALTER TABLE classes DROP COLUMN zoomInfo`);
    }

}
