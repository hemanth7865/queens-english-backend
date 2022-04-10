import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Double, BaseEntity, Table } from "typeorm";
import { Classes } from "./Classes";
import { User } from "./User";

@Entity("student_batches_history")
export class StudentBatchesHistory extends BaseEntity {
    StudentBatchesHistory() { }

    @PrimaryGeneratedColumn()
    id: string;

    @Column({ 'nullable': true })
    batchId: string

    @Column({ 'nullable': true })
    studentId: string;

    @Column({ 'nullable': true })
    active: boolean;

    @CreateDateColumn()
    @Column({ 'nullable': true, type: "datetime" })
    created_at: Date

    @UpdateDateColumn()
    @Column({ 'nullable': true, type: "datetime" })
    updated_at: Date

    @OneToOne(() => User)
    @JoinColumn({name : "studentId"})
    student: User;
    
    batch: Classes;
}
