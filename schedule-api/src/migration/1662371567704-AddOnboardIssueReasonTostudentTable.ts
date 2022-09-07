import {MigrationInterface, QueryRunner} from "typeorm";

export class AddOnboardIssueReasonTostudentTable1662371567704 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasColumn("student", "onboardingIssueReason"))) {
            await queryRunner.query(`ALTER TABLE student ADD onboardingIssueReason TEXT NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE student DROP COLUMN onboardingIssueReason`);
    }

}
