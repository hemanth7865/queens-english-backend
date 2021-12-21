import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { Classes } from "./Classes";
import { Assessment } from "./Assessment";
import { User } from "./User";

@Entity("student_assessment")
export class StudentAssessment extends BaseEntity {
  StudentAssessment() {}

  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  student_id: string;

  @Column()
  batch_id: string;

  @Column()
  assessment_id: string;

  @Column()
  teacher_id: string;

  @Column({ nullable: true })
  due_date: Date;

  @Column({ nullable: true })
  assessment_date: Date;

  @Column({ nullable: true })
  created_at: number;

  @Column({ nullable: true })
  score: number;

  @Column({ nullable: true })
  updated_at: number;

  @OneToOne(() => Classes)
  @JoinColumn({ name: "batch_id" })
  batch: Classes;

  @OneToOne(() => Assessment)
  @JoinColumn({name : "assessment_id"})
  assessment: Assessment;

  @OneToOne(() => User)
  @JoinColumn({name : "teacher_id"})
  teacher: User;
}
