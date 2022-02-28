import {Entity, Column,  PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Double, BaseEntity, Table} from "typeorm";
import { Student } from "./Student";

@Entity("student_availability")
export class StudentAvailability extends BaseEntity {
    StudentAvailability() {}
    
    @PrimaryGeneratedColumn("uuid")
        id: string;

    @Column({'nullable':true, type:"datetime"})
        start_date:Date
    
    @Column({'nullable':true})
        availabilityType: Number;

    @Column({'nullable':true})
        start_slot: Number;
    @Column({'nullable':true})
        end_slot: Number;
    
    @Column({'nullable':true})
        start_min: Number;
    @Column({'nullable':true})
        end_min: Number;

    @Column({'nullable':true})
        startMin: Number;
    @Column({'nullable':true})
        endMin: Number;

    @Column({'nullable':true})
        weekday: Number;
     
    @CreateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        created_at:Date

    @UpdateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        updated_at:Date
    

    student: Student;
}
