import { MigrationInterface, QueryRunner } from "typeorm";

export class createSRATable1670318152484 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable("sra"))) {
            await queryRunner.query(
                "CREATE TABLE `sra` (`id` VARCHAR(255) NOT NULL,`name` VARCHAR(255) NOT NULL,`email` VARCHAR(255),`mobile` VARCHAR(255),`status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active', PRIMARY KEY(`id`));"
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable("sra"))) {
            await queryRunner.query(
                "CREATE TABLE `sra` (`id` VARCHAR(255) NOT NULL,`name` VARCHAR(255) NOT NULL,`email` VARCHAR(255),`mobile` VARCHAR(255),`status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active', PRIMARY KEY(`id`));"
            );
            //await queryRunner.query("DROP TABLE `sra`;");
        }
    }

}
