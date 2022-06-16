import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToOne,
    JoinColumn,
    BaseEntity,
    OneToMany,
    PrimaryColumn,
} from "typeorm";
import { Student } from "./Student";

/**
 * Student transaction information
 */

@Entity("installments")
export class Transactions extends BaseEntity {
    Transactions() { }
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column({ type: "text", name: "student_id" })
    studentId: string;
    @Column({ type: "text", name: "reference_id" })
    transactionId: string;
    @Column({ type: "text", name: "collection_agent" })
    collectionAgent: number;
    @Column({ nullable: true, type: "date", name: "due_date" })
    dueDate: Date;
    @Column({ nullable: true, type: "date", name: "paid_date" })
    paidDate: Date;
    @Column({ nullable: true, type: "text", name: "emi_amount" })
    emiAmount: string;
    @Column({ nullable: true, type: "text", name: "paid_amount" })
    paidAmount: string;
    @Column({ nullable: true, type: "text", name: "payment_status" })
    status: string;
    @Column({ nullable: true, type: "text", name: "payment_link" })
    paymentLink: string;
    @Column({ nullable: true, type: "text", name: "subscription_id" })
    subscriptionId: string;
    @Column({ nullable: true, type: "text", name: "netbank_ref_link" })
    netbankRefLink: string;
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
    @Column({ 'nullable': true, type: "date", name: "last_checked_at" })
    lastCheckedAt: Date;
    @OneToOne((type) => Student, (student) => student.id)
    @JoinColumn({ name: "student_id" })
    student: Student;
}
