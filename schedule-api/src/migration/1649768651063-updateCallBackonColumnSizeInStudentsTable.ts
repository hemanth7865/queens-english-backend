import { MigrationInterface, QueryRunner } from "typeorm";

export class updateCallBackonColumnSizeInStudentsTable1649768651063 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE student MODIFY callBackon TEXT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
