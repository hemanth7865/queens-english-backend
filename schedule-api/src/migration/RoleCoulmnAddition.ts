import {MigrationInterface, QueryRunner} from "typeorm";

export class AddsuperadminColumn1654126136310 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('admin', 'role')) {
            await queryRunner.query(`ALTER TABLE admin ADD role ENUM ('admin', 'superadmin', teacher','zoom','programmanager','pmhead','sales') NOT NULL DEFAULT 'admin'`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('admin', 'role')) {
            await queryRunner.query(`ALTER TABLE 'admin' DROP 'role'`);
        }
    }

}