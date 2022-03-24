import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Double,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { StudentAvailability } from "./StudentAvailability";


@Entity("student")
export class Student extends BaseEntity {
  Student() {}
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column({ nullable: true })
  teacherName: string;
  @Column({ nullable: true})
  batchCode:string;
  @Column({ nullable: true})
  alternativeMobile: string;
  @Column({ nullable: true})
  studentName: string;
  @Column({ nullable: true})
  studentID: string;
  @Column({ nullable: true})
  age: string;
  @Column({ nullable: true})
  address: string;
  @Column({ nullable: true})
  classType: string;
  @Column({ nullable: true})
  referralCode:String;
  @Column({ nullable: true})
  days:number;
  @Column({ nullable: true})
  status:string;
  @Column({ nullable: true})
  studentType:string;
  @Column({ nullable: true})
  courseFrequency:string;
  @Column({ nullable: true})
  timings:string;
  @Column({ nullable: true, type:"date" })
  dateOfBirth: Date;
  @Column({ nullable: true })
  poc: string;
  @Column({ nullable: true, type:"date" })
  startDate: Date;
  @Column({ nullable: true, type:"date" })
  endDate: Date; 
  @Column({ nullable: true })
  startLesson: string;
  @Column({ nullable: true })
  firstFeedback: string;
  @Column({ nullable: true })
  fifthFeedback:string;
  @Column({ nullable: true })
  fifteenthFeedback:string ;
  @Column({ nullable: true })
  classesCompleted: string;
  @Column({ nullable: true })
  customersReferred: string;
  @Column({ nullable: true })
  bottleSend: boolean;
  @Column({ nullable: true })
  wabatch: boolean;
  @Column({ nullable: true })
  logApp: boolean;
  @Column({ nullable: true })
  pfirstName: string;
  @Column({ nullable: true })
  plastName: string;
  @Column({ nullable: true })
  comments: string;
  @Column({ nullable: true })
  incentive: string;
  @Column({ nullable: true })
  classesPurchase: string;
  @Column({ nullable: true })
  classesAttended: string;
  @Column({ nullable: true })
  classesMissed: string;
  @Column({ nullable: true })
  partner: string;
  @Column({ nullable: true })
  lesson: string;
  @Column({ nullable: true })
  course: string;
  @Column({ nullable: true })
  assesmentComplete	: string;
  @Column({ nullable: true })
  assesmentMissed: string;
  @Column({ nullable: true })
  averageScore: string;
  @Column({ nullable: true })
  batchChange: string;
  @Column({ nullable: true })
  prm_id: number;
  @Column({ nullable: true, type:"date" })
  assesmentDate: Date;


  
  @Column({ nullable: true, type: "date" })
  crossedEndDate: Date;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;


}
