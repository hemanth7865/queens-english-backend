import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Double, BaseEntity, OneToMany, PrimaryColumn } from "typeorm";
import { Status } from "./Status";
import { Nationality } from "./Nationality";
import { User } from "./User";
import { TeacherAvailability } from "./TeacherAvailability";

@Entity("lesson")
export class Lesson extends BaseEntity {
    Lesson() { }
    @PrimaryColumn()
    lessonNumber: number;
    @Column({ 'nullable': true, type: "text" })
    id: string;
}
