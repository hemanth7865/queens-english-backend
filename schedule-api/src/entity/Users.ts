import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
ManyToOne, OneToOne, JoinColumn, BaseEntity, OneToMany} from "typeorm";
import { Status } from "./Status";
import {Nationality} from "./Nationality";
import { Lead } from "./Lead";
import {LeadAvailability} from "./LeadAvailability";
//import { Lead } from "./Lead";

@Entity()
export class Users extends BaseEntity {
    name: string;
    exp: string;
    Users() {}
    @PrimaryGeneratedColumn()
        id: number;
    @Column("text")
        firstname: string;
    @Column("text")
        lastname: string;
    @Column("text")
        gender:string;
    @Column("text")
        mobile: string;
    @Column("text")
        email: string;
    @Column("text")
        address: string;
    @Column({'nullable':true, type:"text"})
        whatsapp: string;
    @Column({'nullable':true, type:"datetime"})
        dob:Date;
    @Column({'nullable':true})
        nationalityId: number;
    /*@ManyToOne(
        () => Status,
        (nationality) => nationality.id   
        )
        nationality: Nationality;*/
    
    @Column()
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
    
    @CreateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        created_at:Date

    @UpdateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        updated_at:Date
    
    @Column({'nullable':true})
        leadId:number;
        @Column({'nullable':true})
        slots:string;

@OneToOne(() => Lead)
    @JoinColumn()
    lead: Lead;

    leadAvailability: LeadAvailability[];

}
