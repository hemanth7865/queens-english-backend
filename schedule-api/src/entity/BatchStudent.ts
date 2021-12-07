import {Entity, Column,  PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Double, BaseEntity, Table} from "typeorm";
import { Status } from "./Status";
import {Nationality} from "./Nationality";
import { User } from "./User";
import { Teacher } from "./Teacher";
import { Classes } from "./Classes";

@Entity("batch_students")
export class BatchStudent extends BaseEntity {
    BatchStudents() {}
    
    @PrimaryGeneratedColumn("uuid")
        id: string;

    @Column({'nullable':true})
        batchId:string
    
    @Column({'nullable':true})
        studentId: string;

    @Column({'nullable':true})
        type: string;
     
    @CreateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        created_at:Date

    @UpdateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        updated_at:Date
    
  //  @ManyToOne(() => Classes, classes => classes.batchAvailability)
    classes: Classes;

}
