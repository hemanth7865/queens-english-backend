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
  studentId: string;
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
  @Column({ nullable: true })
  dateOfBirth: Date;
  @Column({ nullable: true })
  poc: string;
  @Column({ nullable: true })
  startingDate: Date;
  @Column({ nullable: true })
  endingDate: string; 
  @Column({ nullable: true })
  startingLesson: Date;
  @Column({ nullable: true })
  firstFeedback: string;
  @Column({ nullable: true })
  fifthFeedback: string;
  @Column({ nullable: true })
  fifteenthFeedback: string;
  @Column({ nullable: true })
  classesCompleted: string;
  @Column({ nullable: true })
  customersReferred: string;
  @Column({ nullable: true, type: "date" })
  crossedEndDate: Date;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
