import {Entity, Column,  PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Double, BaseEntity, Table} from "typeorm";
import { Status } from "./Status";
import {Nationality} from "./Nationality";
import { User } from "./User";
import { Teacher } from "./Teacher";
import { Batch } from "./Batch";

@Entity("batch_availability")
export class BatchAvailability extends BaseEntity {
    BatchAvailability() {}
    
    @PrimaryGeneratedColumn("uuid")
        id: string;

    @Column({'nullable':true, type:"datetime"})
        start_date:Date
        @Column({'nullable':true, type:"datetime"})
        end_date:Date

    @Column({'nullable':true})
        start_slot: number;
    @Column({'nullable':true})
        end_slot: number;
    
    @Column({'nullable':true})
        start_min: number;
    @Column({'nullable':true})
        end_min: Number;

    @Column({'nullable':true})
        startMin: number;
    @Column({'nullable':true})
        endMin: number;

    @Column({'nullable':true})
        weekday: Number;
     
    @CreateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        created_at:Date

    @UpdateDateColumn()
    @Column({'nullable':true,type:"datetime"})
        updated_at:Date
    
    @ManyToOne(() => Batch, batch => batch.batchAvailability)
    batch: Batch;
}
