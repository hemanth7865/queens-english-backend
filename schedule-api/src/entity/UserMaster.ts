import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn,
ManyToOne, OneToOne, JoinColumn, BaseEntity, OneToMany, PrimaryColumn} from "typeorm";
import { Status } from "./Status";
import {Nationality} from "./Nationality";
import { Teacher } from "./Teacher";
import {TeacherAvailability} from "./TeacherAvailability";
//import { Lead } from "./Lead";

@Entity("user_master")
export class UserMaster extends BaseEntity {
    UserMaster() {}

    @PrimaryColumn()
        id: string;
    @Column("text")
        firstName: string;
    @Column("text")
        lastName: string;
    @Column({'nullable':true})
        phoneNumber: string;
    @Column("text")
        email: string;
    @Column({'nullable':true})
        type: string;
    @Column({'nullable':true})
        ts: number;    
}
