import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
    ManyToOne, OneToOne, JoinColumn, BaseEntity, OneToMany, PrimaryColumn
} from "typeorm";

@Entity("payment_mode_details")
export class PaymentModeDetails extends BaseEntity {

    PaymentModeDetails() { }
    @PrimaryGeneratedColumn("uuid")
    id: String;
    @Column("text")
    studentId: string;
    @Column({ 'nullable': true, type: "text" ,name:"razorpay_link"})
    razorpayLink: string;
    @Column({ 'nullable': true, type: "text" })
    status: string;
    @Column({type:"text",name:"transaction_reference"})
    transactionReference: string;
    @Column({ 'nullable': true })
    comments: string;
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
}