import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeStudentCommentsColumnToText1649580037516 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE student MODIFY comments TEXT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
