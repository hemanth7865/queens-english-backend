import { MigrationInterface, QueryRunner } from "typeorm";

export class locationsForSchool1673901773997 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("school", "country"))) {
            await queryRunner.query(`ALTER TABLE school ADD (country varchar(100), state varchar(100), city varchar(100));`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("school", "country"))) {
            await queryRunner.query(`ALTER TABLE school DROP (country varchar(100), state varchar(100), city varchar(100));`);
        }
    }

}
