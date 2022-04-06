import {MigrationInterface, QueryRunner} from "typeorm";

export class CreatePRMRecords1649167480590 implements MigrationInterface {
    protected records = [
        "Abhishek Kundlia", "Aman Naik", "Aneesh Biswas", "Gaurangana Bhadauria", "Molishka Rai", "Ritik Sahni", "Salima Chhatriwala", "Puja Mishra",
        "Satprit Kaur Kavalajit Singh Monga", "Karman Kaur Gandhi", "Ameen Mohammed"
    ];

    public async up(queryRunner: QueryRunner): Promise<void> {
        let id = 1;
        let phoneNumber = "1234567899";
        let gender = "Male";
        let email = "abc@abc.com";
        for(let column of this.records){
            await queryRunner.query(`REPLACE INTO prm SET id='${id}', firstName='${column.split(" ")[0]}', lastName='${column.split(" ").filter((i, index) => index !== 0 ).join(" ")}' , phoneNumber='${phoneNumber}', gender='${gender}', email='${email}'`);
            id ++;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
