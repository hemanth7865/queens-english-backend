import {Entity, Column,  PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Double, BaseEntity, OneToMany} from "typeorm";
import { Status } from "./Status";
import {Nationality} from "./Nationality";
import { User } from "./User";
import { TeacherAvailability } from "./TeacherAvailability";

@Entity("classes")
export class Classes extends BaseEntity {
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
        startingLessonId: string;
    
    @Column({'nullable':true})
        endingLessonId: string;

    @Column({'nullable':true, type:"datetime"})
        classStartDate: Date;        
    
    @Column({'nullable':true, type:"datetime"})
        classEndDate: Date;
    
    @Column({'nullable':true})
        noofclasses: number;
    
    @Column({'nullable':true, type:"datetime"})
        lessonStartTime: Date;

    @Column({'nullable':true, type:"datetime"})
        lessonEndTime: Date;

    @Column({'nullable':true, type:"text"})
        version:string

    @Column({'nullable':true, type:"text"})
        ageGroup: string

    @Column({'nullable':true, type:"text"})
        type: string

    @CreateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        created_at:Date

    @UpdateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        updated_at:Date

}
