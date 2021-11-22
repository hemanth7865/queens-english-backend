import {Entity, Column,  PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Double, BaseEntity, OneToMany} from "typeorm";
import { Status } from "./Status";
import {Nationality} from "./Nationality";
import { User } from "./User";
import { BatchAvailability } from "./BatchAvailability";
import { BatchStudents } from "./BatchStudentDetails";
import { CosmosClass } from "./CosmosClass";

@Entity("batch")
export class Batch extends BaseEntity {
    Batch() {}
    @PrimaryGeneratedColumn()
        id: number;
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

    @OneToMany(() => BatchAvailability, batchAvailability => batchAvailability.batch)
    batchAvailability: BatchAvailability[];

    @OneToOne(() => CosmosClass)
    @JoinColumn()
    cosmosClass: CosmosClass;

    

    @OneToMany(() => BatchStudents, batchStudents => batchStudents.batch)
    batchStudent: BatchStudents[];

}
