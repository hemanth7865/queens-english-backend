import {MigrationInterface, QueryRunner} from "typeorm";

export class addClassesAges1648213242381 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE classes ADD maxAge TINYINT(128) NULL`);
        await queryRunner.query(`ALTER TABLE classes ADD minAge TINYINT(128) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE classes DROP maxAge`);
        await queryRunner.query(`ALTER TABLE classes DROP minAge`);
    }
}
