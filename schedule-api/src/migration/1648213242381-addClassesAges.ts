import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class addClassesAges1648213242381 implements MigrationInterface {

    columns = [
        {
            name: 'maxAge',
            table: 'classes',
            type: 'int',
            isNullable: true
        },
        {
            name: 'minAge',
            table: 'classes',
            type: 'int',
            isNullable: true
        }
    ];

    public async up(queryRunner: QueryRunner): Promise<void> {
        for (let column of this.columns) {
            if (!await queryRunner.hasColumn(column.table, column.name)) {
                await queryRunner.addColumn(column.table, new TableColumn(column));
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        for (let column of this.columns) {
            await queryRunner.dropColumn(column.table, column.name);
        }
    }
}
