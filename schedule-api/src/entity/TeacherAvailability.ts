import {Entity, Column,  PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Double, BaseEntity, Table} from "typeorm";
import { Status } from "./Status";
import {Nationality} from "./Nationality";
import { User } from "./User";
import { Teacher } from "./Teacher";
import { Batch } from "./Batch";

@Entity("teacher_availability")
export class TeacherAvailability extends BaseEntity {
    TeacherAvailability() {}
    
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
    
    @ManyToOne(() => Teacher, teacher => teacher.teacherAvailability)
    teacher: Teacher;
}
