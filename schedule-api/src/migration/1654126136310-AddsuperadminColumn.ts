import {MigrationInterface, QueryRunner} from "typeorm";

export class AddsuperadminColumn1654126136310 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('admin', 'superadmin')) {
            await queryRunner.query(`ALTER TABLE 'admin' ADD 'superadmin' ENUM ('false', 'true') NOT NULL DEFAULT 'false'`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('admin', 'superadmin')) {
            await queryRunner.query(`ALTER TABLE 'admin' DROP 'superadmin'`);
        }
    }

}