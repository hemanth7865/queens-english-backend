import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
    ManyToOne, OneToOne, JoinColumn, BaseEntity, OneToMany, PrimaryColumn
} from "typeorm";

/**
 * Student transaction information
 */

@Entity("transactions")
export class Transactions extends BaseEntity {

    Transactions() { }
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column({type:"text",name:"student_id"})
    studentId: string;
    @Column({type:"text",name:"transaction_id"})
    transactionId: string;
    @Column({ 'nullable': true, type: "date",name:"due_date" })
    dueDate: Date;
    @Column({ 'nullable': true, type: "date",name:"paid_date" })
    paidDate: Date;
    @Column({ 'nullable': true, type: "text",name:"emi_amount" })
    emiAmount: string;
    @Column({ 'nullable': true, type: "text",name:"paid_amount" })
    paidAmount: string;
    @Column({ 'nullable': true,type:"text",name:"payment_status" })
    status: string;
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
}