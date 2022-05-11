import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWaMessageSentTostudentTable1649167893771 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('student', 'waMessageSent')) {
            await queryRunner.query(`ALTER TABLE student ADD waMessageSent VARCHAR(200) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn('student', 'waMessageSent')) {
            await queryRunner.query(`ALTER TABLE student DROP waMessageSent`);
        }
    }

}
