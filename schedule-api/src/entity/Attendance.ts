import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToOne, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { Session } from "./Session";
import { User } from "./User";

@Entity("attendance")
export class Attendance extends BaseEntity {
  name: string;
  Session() { }

  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  sessionId: number;

  @Column()
  studentId: string;

  @Column()
  is_present: number;

  @Column({ nullable: true })
  start_time: Date;

  @Column({ nullable: true })
  end_time: Date;

  @Column({ nullable: true })
  created_at: number;

  @Column({ nullable: true })
  updated_at: number;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @ManyToOne(() => Session, session => session.attendances)
  session: Session;

  @OneToOne(() => User)
  @JoinColumn({ name: "studentId" })
  student: User;
}
