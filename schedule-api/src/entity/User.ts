import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
ManyToOne, OneToOne, JoinColumn, BaseEntity, OneToMany} from "typeorm";
import { Status } from "./Status";
import {Nationality} from "./Nationality";
import { Teacher } from "./Teacher";
import {TeacherAvailability} from "./TeacherAvailability";
//import { Lead } from "./Lead";

@Entity("user")
export class User extends BaseEntity {
    name: string;
    exp: string;
    classestaken: number;
    leadtype:number;
    joiningdate:Date;
    ratings:number;
    cosmos_ref: string;
    User() {}

    @Column({'nullable':true})
        id: string;
    @PrimaryGeneratedColumn()
        userId:number;
    @Column("text")
        firstName: string;
    @Column("text")
        lastName: string;
    @Column({'nullable':true})
        gender:string;
    @Column("text")
        phoneNumber: string;
    @Column("text")
        email: string;
    @Column({'nullable':true})
        code: number;
    @Column({'nullable':true})
        ts: number;
    @Column({'nullable':true})
        address: string;
    @Column({'nullable':true, type:"text"})
        whatsapp: string;
    @Column({'nullable':false, type:"text"})
        type: string;
    @Column({'nullable':true, type:"date"})
        dob:Date;
    @Column({'nullable':true})
        nationalityId: number;
    /*@ManyToOne(
        () => Status,
        (nationality) => nationality.id   
        )
        nationality: Nationality;*/
    
    @Column({'nullable':true})
        statusId: number;
    /*@ManyToOne(
        () => Status,
        (status) => status.id   
        )
        @JoinColumn()
        status: Status;*/
    @Column({'nullable':true,type:"text"})
        photo: string;
    @Column({'nullable':true,type:"text"})
        languages: string;


        @Column({'nullable':true,type:"date"})
            startDate:Date    
    
    @CreateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        created_at:Date

    @UpdateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        updated_at:Date
    
    @Column({'nullable':true})
        teacherId:number;



    @Column({'nullable':true})
        slots:string;

@OneToOne(() => Teacher)
    @JoinColumn()
    teacherData: Teacher;

    teacher:Teacher[];   

    teacherAvailability: TeacherAvailability[];

}
