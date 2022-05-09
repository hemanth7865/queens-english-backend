import {
    Entity, Column,
    PrimaryGeneratedColumn, OneToOne,
    JoinColumn, CreateDateColumn, UpdateDateColumn
} from "typeorm";

@Entity()
export class Status {
    Status() { }
    @PrimaryGeneratedColumn()
    id: number;
    @Column("text")
    value: string;
    @Column("text")
    description: string;
}
