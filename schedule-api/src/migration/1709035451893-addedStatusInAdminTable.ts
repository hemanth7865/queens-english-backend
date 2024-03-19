import {MigrationInterface, QueryRunner} from "typeorm";

export class addedStatusInAdminTable1709035451893 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("admin", "status"))) {
            const query = `ALTER TABLE admin ADD COLUMN status VARCHAR(50) DEFAULT 'active'`;
            await queryRunner.query(query);
          }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn("admin", "status")){
            await queryRunner.query(`ALTER TABLE admin DROP COLUMN status`);
        }

    }

}
