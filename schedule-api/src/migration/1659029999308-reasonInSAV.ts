import { MigrationInterface, QueryRunner } from "typeorm";

export class reasonInSAV1659029999308 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('student', 'reasonInSAV')) {
            await queryRunner.query(`ALTER TABLE student ADD reasonInSAV VARCHAR(255) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn('student', 'reasonInSAV')) {
            await queryRunner.query(`ALTER TABLE student DROP COLUMN reasonInSAV`);
        }
    }

}
