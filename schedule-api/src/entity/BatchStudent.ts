import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Double, BaseEntity, Table } from "typeorm";
import { Classes } from "./Classes";
import { User } from "./User";

@Entity("batch_students")
export class BatchStudent extends BaseEntity {
    name: string;
    BatchStudents() { }

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ 'nullable': true })
    batchId: string

    @Column({ 'nullable': true })
    studentId: string;

    @Column({ 'nullable': true })
    type: string;

    @CreateDateColumn()
    @Column({ 'nullable': true, type: "datetime" })
    created_at: Date

    @UpdateDateColumn()
    @Column({ 'nullable': true, type: "datetime" })
    updated_at: Date

    @OneToOne(() => User)
    @JoinColumn({name : "id"})
    student: User;

    classes: Classes;

}
