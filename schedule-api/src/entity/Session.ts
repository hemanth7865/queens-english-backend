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
import { Attendance } from "./Attendance";
import { User } from "./User";

@Entity("session")
export class Session extends BaseEntity {
  Session() { }

  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  teacherId: string;

  @Column()
  batchId: string;

  @Column()
  lessonId: string;

  @Column({ nullable: true })
  session_date: Date;

  @Column({ nullable: true })
  start_time: Date;

  @Column({ nullable: true })
  end_time: Date;

  @Column({ nullable: true })
  created_at: number;

  @Column({ nullable: true })
  updated_at: number;

  @Column()
  recording_url: string;

  @Column()
  recorded: boolean;

  @OneToOne(() => Classes)
  @JoinColumn({ name: "batchId" })
  batch: Classes;

  @OneToMany(() => Attendance, attendance => attendance.session)
  @JoinColumn({ name: "sessionId" })
  attendances: Attendance[];

  @OneToOne(() => User)
  @JoinColumn({ name: "teacherId" })
  teacher: User;
}
