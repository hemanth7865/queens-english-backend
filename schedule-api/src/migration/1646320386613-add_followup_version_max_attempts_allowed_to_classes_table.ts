import { MigrationInterface, QueryRunner } from "typeorm";

export class addFollowupVersionMaxAttemptsAllowedToClassesTable1646320386613 implements MigrationInterface {
    name = 'addFollowupVersionMaxAttemptsAllowedToClassesTable1646320386613'

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn('classes', 'followupVersion')) {
            await queryRunner.query(
                `ALTER TABLE classes ADD followupVersion VARCHAR(45) NULL`
            );
        }
        if (!await queryRunner.hasColumn('classes', 'maxAttemptsAllowed')) {
            await queryRunner.query(`ALTER TABLE classes ADD maxAttemptsAllowed INT(11) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE classes DROP COLUMN followupVersion`);
        await queryRunner.query(`ALTER TABLE classes DROP COLUMN maxAttemptsAllowed`);

    }

}
