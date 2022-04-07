import {MigrationInterface, QueryRunner} from "typeorm";

export class addisSiblingColumnToUserTable1649359181739 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('user', 'isSibling')) { 
            await queryRunner.query(`ALTER TABLE user ADD isSibling BOOLEAN  NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('user', 'salesDataFilled')) { 
            await queryRunner.query(`ALTER TABLE user ADD isSibling BOOLEAN  NULL`);
        }
    }

}
