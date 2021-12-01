import {Entity, Column,  PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Double, BaseEntity, OneToMany} from "typeorm";
import { Status } from "./Status";
import {Nationality} from "./Nationality";
import { User } from "./User";
import { BatchAvailability } from "./BatchAvailability";
import { BatchStudent } from "./BatchStudent";
import { Classes } from "./Classes";

@Entity("batch")
export class Batch extends BaseEntity {
    Batch() {}
    @PrimaryGeneratedColumn("uuid")
        id: string;
    @Column({'nullable':true,type:"text"})
        teacherId: string;
    @Column({'nullable':true,type:"double"})
        userId: Double;

    @Column({'nullable':true,type:"date"})
        creationDate:Date; 
    @Column({'nullable':true,type:"date"})
        endDate:Date;  
    @Column({'nullable':true,type:"text"})
        createdBy: string;

    @CreateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        created_at:Date

    @UpdateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        updated_at:Date

    @OneToOne(() => BatchAvailability)
    @JoinColumn()
    batchAvailability: BatchAvailability;

    @OneToOne(() => Classes)
    @JoinColumn()
    classes: Classes;    

    @OneToMany(() => BatchStudent, batchStudent => batchStudent.batch)
    students: BatchStudent[];

}
