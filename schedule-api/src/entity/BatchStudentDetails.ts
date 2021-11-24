import {Entity, Column,  PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Double, BaseEntity, Table} from "typeorm";
import { Status } from "./Status";
import {Nationality} from "./Nationality";
import { User } from "./User";
import { Teacher } from "./Teacher";
import { Batch } from "./Batch";

@Entity("batch_students")
export class BatchStudents extends BaseEntity {
    BatchStudents() {}
    
    @PrimaryGeneratedColumn()
        id: number;

    @Column({'nullable':true, type:"datetime"})
        batchId:Date
    
    @Column({'nullable':true})
        studentId: Number;
     
    @CreateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        created_at:Date

    @UpdateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        updated_at:Date
    
    @ManyToOne(() => Batch, batch => batch.batchAvailability)
    batch: Batch;

}
