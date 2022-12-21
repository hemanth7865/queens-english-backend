import {
    Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
    ManyToOne, OneToOne, JoinColumn, BaseEntity, OneToMany, PrimaryColumn
} from "typeorm";
import { School } from "./School";

@Entity("sra")
export class SRA extends BaseEntity {
    SRA() { }
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column()
    name: string;
    @Column()
    email: string;
    @Column()
    mobile: string;
    @OneToMany(() => School, school => school.sra)
    schools: School[];
    @Column()
    status: string;
}
