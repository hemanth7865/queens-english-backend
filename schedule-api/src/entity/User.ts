import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  BaseEntity,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { Status } from "./Status";
import { Nationality } from "./Nationality";
import { Teacher } from "./Teacher";
import { TeacherAvailability } from "./TeacherAvailability";
import { StudentAvailability } from "./StudentAvailability";
import { Payment } from "./Payment";
import { ZoomUser } from "./ZoomUser";
import { UserZoomLink } from "./UserZoomLink";
//import { Lead } from "./Lead";

@Entity("user")
export class User extends BaseEntity {
  name: string;
  exp: string;
  classestaken: number;
  leadtype: number;
  joiningdate: Date;
  ratings: number;
  cosmos_ref: string;
  User() {}

  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column("text")
  firstName: string;
  @Column("text")
  lastName: string;
  @Column("text")
  middleName: string;
  @Column({ nullable: true })
  gender: string;
  @Column({ nullable: true })
  phoneNumber: string;
  @Column({ nullable: true })
  alternativeMobile: string;
  @Column({ nullable: true })
  state: string;
  @Column("text")
  email: string;
  @Column({ nullable: true })
  customerEmail: string;
  @Column({ nullable: true })
  code: number;
  @Column({ nullable: true })
  ts: number;
  @Column({ nullable: true })
  address: string;
  @Column({ nullable: true, type: "text" })
  whatsapp: string;
  @Column({ nullable: true, type: "text" })
  type: string;
  @Column({ nullable: true, type: "date" })
  dob: Date;
  @Column({ nullable: true })
  status: string;
  @Column({ nullable: true, type: "text" })
  photo: string;
  @Column({ nullable: true, type: "text" })
  languages: string;

  @Column({ nullable: true, type: "date" })
  startDate: Date;

  @CreateDateColumn()
  @Column({ nullable: true, type: "datetime" })
  created_at: Date;

  @UpdateDateColumn()
  @Column({ nullable: true, type: "datetime" })
  updated_at: Date;

  @Column({ nullable: true })
  teacherId: number;

  @Column({ nullable: true })
  slots: string;

  @Column({ nullable: true })
  userCode: string;

  @Column({ nullable: true })
  offlineStudentCode: string;

  @Column({ nullable: true })
  preventAppAccess: number;

  @Column({ nullable: true, type: "boolean" })
  isSibling: boolean;

  @Column({ nullable: true, type: "boolean" })
  offlineUser: number;

  @Column({ nullable: true })
  schoolId: string;

  @Column({ nullable: true })
  schoolCode: string;

  @Column({ nullable: true })
  loginCode: string;

  @OneToOne(() => Teacher)
  @JoinColumn()
  teacherData: Teacher;

  @Column({ nullable: false, default: false, type: "boolean" })
  demoAccount: boolean;

  teacher: Teacher[];
  payment: Payment[];

  teacherAvailability: TeacherAvailability[];
  studentAvailability: StudentAvailability[];

  @OneToOne((type) => ZoomUser, (zoom_user) => zoom_user.user)
  @JoinColumn({ name: "id" })
  zoom_user: ZoomUser;
  @OneToOne((type) => ZoomUser, (zoom_user) => zoom_user.user)
  @JoinColumn({ name: "id" })
  join_link: UserZoomLink;
}
