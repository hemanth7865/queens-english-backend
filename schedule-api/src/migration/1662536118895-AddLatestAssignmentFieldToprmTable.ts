import {MigrationInterface, QueryRunner} from "typeorm";

export class AddLatestAssignmentFieldToprmTable1662536118895 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("prm", "latestAssignment"))) {
            await queryRunner.query(
              `ALTER table prm add latestAssignment VARCHAR(255)`
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE prm DROP COLUMN latestAssignment`);
    }

}
