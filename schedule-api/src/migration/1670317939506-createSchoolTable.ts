import { MigrationInterface, QueryRunner } from "typeorm";

export class createSchoolTable1670317939506 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable("school"))) {
            await queryRunner.query(
                "CREATE TABLE `school` (`id` VARCHAR(255) NOT NULL,`schoolName` VARCHAR(255) NOT NULL,`schoolCode` VARCHAR(255) NOT NULL, `poc` VARCHAR(255),`sraId` VARCHAR(255) NOT NULL, `createdAt` DATE NOT NULL DEFAULT now(),`schoolStatus` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',PRIMARY KEY(`id`));"
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable("school"))) {
            await queryRunner.query(
                "CREATE TABLE `school` (`id` VARCHAR(255) NOT NULL,`schoolName` VARCHAR(255) NOT NULL,`schoolCode` VARCHAR(255) NOT NULL, `poc` VARCHAR(255),`sraId` VARCHAR(255) NOT NULL, `createdAt` DATE NOT NULL,`schoolStatus` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',PRIMARY KEY(`id`));"
            );
            //await queryRunner.query("DROP TABLE `school`;");
        }
    }

}
