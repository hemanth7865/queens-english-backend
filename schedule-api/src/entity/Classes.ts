import {Entity, Column,  PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Double, BaseEntity, OneToMany} from "typeorm";
import { Status } from "./Status";
import {Nationality} from "./Nationality";
import { User } from "./User";
import { TeacherAvailability } from "./TeacherAvailability";
import { BatchAvailability } from "./BatchAvailability";
import { BatchStudent } from "./BatchStudent";

@Entity("classes")
export class Classes extends BaseEntity {
    name: string;
    Classes() {}
    
       // id: string;
    @PrimaryGeneratedColumn("uuid")
        id: string;
       
    @Column({'nullable':true,type:"text"})
        classCode: string;
    
    @Column({'nullable':true})
        batchNumber: string;
    @Column({'nullable':true})
        teacherId: string;

    @Column({'nullable':true})
        createdBy: string;

    @Column({'nullable':true})
        startingLessonId: string;
    
    @Column({'nullable':true})
        endingLessonId: string;

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


    @Column({'nullable':true,type:"text"})
        classStartDate: string;        
    
    @Column({'nullable':true})
        classEndDate: string;
    
    @Column({'nullable':true})
        noofclasses: number;
    
    @Column({'nullable':true})
        lessonStartTime: string;

    @Column({'nullable':true})
        lessonEndTime: string;

    @Column({'nullable':true, type:"text"})
        version:string

    @Column({'nullable':true, type:"text"})
        ageGroup: string

    @Column({'nullable':true, type:"text"})
        type: string

    @Column({'nullable':true})
        status: number;

    //@CreateDateColumn()
    @Column({'nullable':true})
        created_at:Date

   // @UpdateDateColumn()
    @Column({'nullable':true})
        updated_at:Date

    //@OneToOne(() => BatchAvailability)
    //@JoinColumn()
    batchAvailability: BatchAvailability;

    @OneToOne(() => Classes)
    @JoinColumn()
    classes: Classes;    

    @OneToMany(() => BatchStudent, batchStudent => batchStudent.classes)
    students: BatchStudent[];

}
