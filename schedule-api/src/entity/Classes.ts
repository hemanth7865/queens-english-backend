import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Double, BaseEntity, OneToMany, PrimaryColumn } from "typeorm";
import { BatchAvailability } from "./BatchAvailability";
import { BatchStudent } from "./BatchStudent";
import { User } from "./User";
import { ZoomMeeting } from "./ZoomMeeting";

@Entity("classes")
export class Classes extends BaseEntity {
  name: string;
  Classes() {}

  @PrimaryColumn()
  id: string;

  @Column({ nullable: true, type: "text" })
  classCode: string;

  @Column({ nullable: true, unique: true })
  batchNumber: string;
  @Column({ nullable: true })
  teacherId: string;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  startingLessonId: string;

  @Column({ nullable: true })
  endingLessonId: string;

  @Column({ nullable: true })
  start_slot: Number;
  @Column({ nullable: true })
  end_slot: Number;

  @Column({ nullable: true })
  start_min: Number;
  @Column({ nullable: true })
  end_min: Number;

  @Column({ nullable: true })
  startMin: Number;
  @Column({ nullable: true })
  endMin: Number;

  @Column({ nullable: true })
  weekday: Number;
  @Column({ nullable: true })
  minAge: number;
  @Column({ nullable: true })
  maxAge: number;

  @Column({ nullable: true })
  ages: string;

  @Column({ nullable: true, type: "text" })
  classStartDate: string;

  @Column({ nullable: true })
  classEndDate: string;

  @Column({ nullable: true })
  noofclasses: number;

  @Column({ nullable: true })
  lessonStartTime: string;

  @Column({ nullable: true })
  lessonEndTime: string;

  @Column({ nullable: true, type: "text" })
  version: string;

  @Column({ nullable: true, type: "text" })
  followupVersion: string;

  @Column({ nullable: true })
  maxAttemptsAllowed: number;

  @Column({ nullable: true, type: "text" })
  ageGroup: string;

  @Column({ nullable: true, type: "text" })
  type: string;

  @Column({ nullable: true })
  status: number;

  @Column({ nullable: true })
  frequency: string;

  @Column({ nullable: true })
  zoomLink: string;

  @Column({ nullable: true })
  zoomInfo: string;

  @Column({ nullable: true })
  whatsappLink: string;

  @Column({ nullable: true })
  activeLessonId: string;

  @Column({ nullable: true })
  teacherCode: string;

  @Column({ nullable: true })
  useNewZoomLink: number;

  @Column({ type: "integer" })
  sync_zoom_status: number;

  @Column({ type: "integer" })
  useAutoAttendance: number;

  @Column({ nullable: true })
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;

  batchAvailability: BatchAvailability;

  @OneToOne(() => Classes)
  @JoinColumn()
  classes: Classes;

  @OneToMany(() => BatchStudent, (batchStudent) => batchStudent.classes)
  students: BatchStudent[];

  @OneToOne(() => User)
  @JoinColumn({ name: "teacherId" })
  teacher: User;

  @OneToOne(() => ZoomMeeting, (zoomMeeting) => zoomMeeting.batch)
  @JoinColumn({ name: "id" })
  meeting: User;
}
