import {
    Entity, Column,
    PrimaryGeneratedColumn, OneToOne,
    JoinColumn, CreateDateColumn, UpdateDateColumn
} from "typeorm";

@Entity()
export class Nationality {
    Nationality() { }
    @PrimaryGeneratedColumn()
    id: number;
    @Column("text")
    country: string;
    @Column("text")
    countrycode: string;
    @Column("text")
    nationality: string;
    @Column("text")
    person: string;
}
