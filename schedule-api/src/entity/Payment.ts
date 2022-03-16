import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
    ManyToOne, OneToOne, JoinColumn, BaseEntity, OneToMany, PrimaryColumn
} from "typeorm";
import { Status } from "./Status";
//import {Nationality} from "./Nationality";
// import { Teacher } from "./Teacher";
//import {TeacherAvailability} from "./TeacherAvailability";
//import { Lead } from "./Lead";

@Entity("payment")
export class Payment extends BaseEntity {

    Payment() { }
    @PrimaryGeneratedColumn("uuid")
    id: String;
    @Column("text")
    studentId: string;
    @Column("text")
    paymentid: string;
    @Column("text")
    plantype: string;
    @Column("text")
    classtype: string;
    @Column("text")
    emi: string;
    @Column({ 'nullable': true })
    classessold: number;
    @Column("text")
    saleamount: number;
    @Column({ 'nullable': true, type: "date" })
    dateofsale: Date;
    @Column({ 'nullable': true })
    downpayment: number;
    @Column({ 'nullable': true, type: "date" })
    duedate: Date;
    @Column({ 'nullable': true })
    no_of_delayed_payments: number;
    @Column({ 'nullable': true, type: "date" })
    delay_date: Date;
    @Column({ 'nullable': true })
    delay_status: string;
    @Column({ 'nullable': true })
    paymentMode: string;
    @Column({ 'nullable': true })
    subscription: string;
    @Column({ 'nullable': true })
    emiMonths: string;
    @Column({ 'nullable': true })
    subscriptionNo: string;
    @Column({ 'nullable': true })
    notes: string;
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
}