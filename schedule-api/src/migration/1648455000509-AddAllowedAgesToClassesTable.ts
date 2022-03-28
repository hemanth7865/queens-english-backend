import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAllowedAgesToClassesTable1648455000509 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE classes ADD ages VARCHAR(200) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE classes DROP ages`);
    }

}
