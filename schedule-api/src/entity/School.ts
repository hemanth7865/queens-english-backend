import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
    ManyToOne, OneToOne, JoinColumn, BaseEntity, OneToMany, PrimaryColumn
} from "typeorm";
import { SRA } from "./SRA";
import { Classes } from "./Classes";

@Entity("school")
export class School extends BaseEntity {
    School() { }
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column()
    schoolName: string;
    @Column()
    schoolCode: string;
    @Column({ 'nullable': true })
    poc: string;
    @Column()
    sraId: string;
    @ManyToOne(() => SRA, sra => sra.schools)
    @JoinColumn({ name: "id" })
    sra: SRA;
    @OneToMany(() => Classes, classes => classes.school)
    classes: Classes[];
    @CreateDateColumn({ 'nullable': true })
    createdAt: Date;
    @Column({ 'nullable': true })
    schoolStatus: string;
    @Column({ 'nullable': true })
    country: string;
    @Column({ 'nullable': true })
    state: string;
    @Column({ 'nullable': true })
    city: string;
}
