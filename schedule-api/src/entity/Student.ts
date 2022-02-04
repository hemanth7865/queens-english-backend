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
  studentType:string;
  @Column({ nullable: true, type:"date" })
  dateOfBirth: Date;
  @Column({ nullable: true })
  poc: string;
  @Column({ nullable: true, type:"date" })
  startDate: Date;
  @Column({ nullable: true, type:"date" })
  endDate: Date; 
  @Column({ nullable: true, type:"date" })
  startLesson: Date;
  @Column({ nullable: true })
  firstFeedback: boolean;
  @Column({ nullable: true })
  fifthFeedback: boolean;
  @Column({ nullable: true })
  fifteenthFeedback: boolean;
  @Column({ nullable: true })
  classesCompleted: string;
  @Column({ nullable: true })
  customersReferred: string;
  @Column({ nullable: true })
  bottleSend: boolean;
  
  @Column({ nullable: true, type: "date" })
  crossedEndDate: Date;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;


}
