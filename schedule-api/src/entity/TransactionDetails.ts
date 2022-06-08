import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
    ManyToOne, OneToOne, JoinColumn, BaseEntity, OneToMany, PrimaryColumn
} from "typeorm";
import { Status } from "./Status";

/**
 * Student payment Transaction details
 */

@Entity("transaction_details")
export class TransactionDetails extends BaseEntity {

    TransactionDetails() { }
    @PrimaryGeneratedColumn("uuid")
    id: String;
    @Column({type:"text",name:"transaction_id"})
    transactionId: string;
    @Column({type:"text",name:"razorpay_link"})
    razorpayLink: string;
    @Column({ 'nullable': true })
    status: string;
    @Column({type:"text",name:"whatsapp_link_sent"})
    whatsAppLinkSent: string;
    @Column({type:"text",name:"mode_of_payment"})
    modeOfPayment: string;
    @Column({ 'nullable': true,name:"call_disposition" })
    callDisposition: string;
    @Column({ 'nullable': true, name:"feedback_call"})
    feedBackCall: string;
    @Column({ 'nullable': true, type: "date" , name:"payment_mode"})
    paymentMode: Date;   
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
}