import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCollectionAgentIdToStudentCollection1654857046727
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("student", "collection_agent_id"))) {
      await queryRunner.query(
        `ALTER TABLE student ADD collection_agent_id INT(7) NULL`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("student", "collection_agent_id"))) {
      await queryRunner.query(`ALTER TABLE student DROP collection_agent_id`);
    }
  }
}
