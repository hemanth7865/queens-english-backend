import {Entity, Column,  PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Double, BaseEntity, OneToMany} from "typeorm";
import { Status } from "./Status";
import {Nationality} from "./Nationality";
import { User } from "./User";
import { TeacherAvailability } from "./TeacherAvailability";

@Entity("admin")
export class Admin extends BaseEntity {
    Admin() {}
    @PrimaryGeneratedColumn()
        id: number;
    @Column({'nullable':true,type:"text"})
        firstname: string;    
    @Column({'nullable':true,type:"text"})
        lastname:string;
    @Column({'nullable':true,type:"text"})
        code: string;
    @Column({'nullable':true,type:"text"})
        email: string;
    @Column({'nullable':true,type:"text"})
        phone: string;

    @Column({'nullable':true,type:"text"})
        password: string;
    
        @CreateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        created_at:Date

    @UpdateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        updated_at:Date


}
