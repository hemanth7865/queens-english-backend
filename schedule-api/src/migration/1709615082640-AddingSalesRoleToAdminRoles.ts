import {MigrationInterface, QueryRunner} from "typeorm";

export class AddingSalesRoleToAdminRoles1709615082640 implements MigrationInterface {

   

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add a new temporary column with the updated enum values
        await queryRunner.query(
          `ALTER TABLE admin ADD COLUMN role_temp ENUM('admin', 'superadmin', 'teacher', 'zoom', 'programmanager', 'pmhead', 'sales')`
        );
    
        // Copy the data from the old column to the new column
        await queryRunner.query(`UPDATE admin SET role_temp = role`);
    
        // Drop the old column
        await queryRunner.query(`ALTER TABLE admin DROP COLUMN role`);
    
        // Rename the new column to the old column's name
        await queryRunner.query(
          `ALTER TABLE admin CHANGE COLUMN role_temp role ENUM('admin', 'superadmin', 'teacher', 'zoom', 'programmanager', 'pmhead', 'sales')`
        );
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        // Add a new temporary column with the updated enum values
        await queryRunner.query(
          `ALTER TABLE admin ADD COLUMN role_temp ENUM('admin', 'superadmin', 'teacher', 'zoom', 'programmanager', 'pmhead')`
        );
    
        // Copy the data from the old column to the new column
        await queryRunner.query(`UPDATE admin SET role_temp = role`);
    
        // Drop the old column
        await queryRunner.query(`ALTER TABLE admin DROP COLUMN role`);
    
        // Rename the new column to the old column's name
        await queryRunner.query(
          `ALTER TABLE admin CHANGE COLUMN role_temp role ENUM('admin', 'superadmin', 'teacher', 'zoom', 'programmanager', 'pmhead')`
        );

      }
}