import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
    ManyToOne, OneToOne, JoinColumn, BaseEntity, OneToMany, PrimaryColumn
} from "typeorm";
//import { Lead } from "./Lead";

@Entity("prm")
export class PRManager extends BaseEntity {
    PRManager() { }
    @PrimaryGeneratedColumn()
    //@NextVal('seq_client')
    id: string;
    @Column("text")
    firstName: string;
    @Column("text")
    lastName: string;
    @Column({ 'nullable': true })
    gender: string;
    @Column({ 'nullable': true })
    phoneNumber: string;
    @Column({ 'nullable': true })
    alternativeMobile: string;
    @Column("text")
    email: string;
}
