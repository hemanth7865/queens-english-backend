import {Entity, Column,  PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Double, BaseEntity, Table} from "typeorm";
import { Status } from "./Status";
import {Nationality} from "./Nationality";
import { Users } from "./Users";
import { Lead } from "./Lead";

@Entity("lead_availability")
export class LeadAvailability extends BaseEntity {
    LeadAvailability() {}
    
    @PrimaryGeneratedColumn()
        id: number;

    @Column("datetime")
        start_date:Date
    @Column({'nullable':true})
        start_slot: Number;
    @Column({'nullable':true})
        end_slot: Number;
    @Column({'nullable':true})
        weekday: Number;
     
    @CreateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        created_at:Date

    @UpdateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        updated_at:Date
    
    @ManyToOne(() => Lead, lead => lead.leadAvailability)
    lead: Lead;
}
