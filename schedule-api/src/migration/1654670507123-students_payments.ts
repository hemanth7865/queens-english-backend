import {MigrationInterface, QueryRunner} from "typeorm";

export class studentsPayments1654670507123 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasTable('transactions')) {
            await queryRunner.query(`
            CREATE TABLE transactions (
                id varchar(36) NOT NULL,
                student_id varchar(36) DEFAULT NULL,
                transaction_id varchar(45) DEFAULT NULL,
                due_date datetime DEFAULT NULL,
                paid_date datetime DEFAULT NULL,
                emi_amount varchar(45) DEFAULT NULL,
                paid_amount varchar(45) DEFAULT NULL,
                collection_agent varchar(45) DEFAULT NULL,
                payment_status varchar(45) DEFAULT NULL,
                currency varchar(45) DEFAULT NULL,
                installment_no int DEFAULT NULL,
                created_at datetime DEFAULT NULL,
                updated_at datetime DEFAULT NULL,
                PRIMARY KEY (id)
              );
            `);
        }
        if (!await queryRunner.hasTable('transaction_details')) {
            await queryRunner.query(`
              CREATE TABLE transaction_details (
                id varchar(36) NOT NULL,
                transaction_id varchar(45) DEFAULT NULL,
                razorpay_link varchar(45) DEFAULT NULL,
                status varchar(45) DEFAULT NULL,
                whatsapp_link_sent varchar(45) DEFAULT NULL,
                mode_of_payment varchar(45) DEFAULT NULL,
                call_disposition varchar(45) DEFAULT NULL,
                feedback_call varchar(45) DEFAULT NULL,
                payment_mode varchar(45) DEFAULT NULL,
                created_at datetime DEFAULT NULL,
                updated_at datetime DEFAULT NULL,
                PRIMARY KEY (id)
              );
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable('transactions')) {
            await queryRunner.query(`DROP TABLE transactions`);
        }
        if (await queryRunner.hasTable('transactions')) {
            await queryRunner.query(`DROP TABLE transaction_details`);
        }
    }

}
