import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import {
  ContractStatus,
  InitialPaymentStatus,
  LeadCategory,
  PackageName,
  SchoolStage,
  SchoolStatus,
} from "../types";
import { Classes } from "./Classes";
import { SRA } from "./SRA";

@Entity("school")
export class School extends BaseEntity {
  School() {}
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  leadId: string;
  @Column()
  schoolName: string;
  @Column()
  schoolCode: string;
  @Column()
  locationCode: string;
  @Column()
  schoolId: string;
  @Column({ nullable: true })
  poc: string;
  @Column()
  sraId: string;
  @ManyToOne(() => SRA, (sra) => sra.id, { cascade: true })
  @JoinColumn({ name: "sraId" })
  sra: SRA;
  @OneToMany(() => Classes, (classes) => classes.school)
  classes: Classes[];
  @CreateDateColumn({ nullable: true })
  createdAt: Date;
  @Column({ nullable: true })
  country: string;
  @Column({ nullable: true })
  state: string;
  @Column({ nullable: true })
  city: string;
  @Column({ type: "boolean", default: false })
  lockLesson: boolean;

  @Column({
    type: "enum",
    enum: SchoolStatus,
    default: SchoolStatus.Active,
  })
  schoolStatus: SchoolStatus;

  @Column({ type: "datetime", nullable: true, name: "startDate" })
  startDate: Date;

  @Column({ nullable: true, name: "mapLocationURL" })
  mapLocationURL: string;

  // Fields from OneHash
  @Column()
  studentCount: number;
  @Column({ nullable: true })
  leadOwner: string;
  @Column({ nullable: true, type: "enum", enum: PackageName })
  package: PackageName | null;
  @Column({ nullable: true })
  address: string;
  @Column({ nullable: true })
  territory: string;
  @Column()
  expectedPrice: number;
  @Column()
  revenue: number;
  @Column()
  realRevenue: number;
  @Column({ nullable: true })
  paidDate: string; // enrollment date
  @Column({ nullable: true })
  postalCode: string;
  @Column({ nullable: true, type: "enum", enum: LeadCategory })
  leadCategory: LeadCategory | null; // renewal or new sale
  @Column({ nullable: true })
  designation: string;

  @Column({
    type: "enum",
    enum: SchoolStage,
    default: SchoolStage.ToBeOnBoarded,
  })
  stage: SchoolStage;

  @Column({
    nullable: true,
  })
  schoolPackageId: string;

  @Column({ type: "boolean", default: false })
  hasTVForITTs: boolean;

  @Column({ type: "integer", default: 0 })
  teacherCount: number;

  @Column({ type: "integer", default: 0 })
  initialAmount: number;

  @Column({ type: "enum", enum: ["partial", "full"], nullable: true })
  paymentType: string;

  @Column({ type: "integer", default: 0 })
  paymentCycle: number;

  @Column({ type: "datetime", nullable: true })
  booksDate: Date;

  @Column()
  SLName: string;
  @Column()
  SLEmail: string;
  @Column()
  SLPhone: string;

  @Column({
    type: "boolean",
    default: false,
  })
  trainingCompleted: boolean;

  @Column({
    type: "enum",
    enum: InitialPaymentStatus,
    default: InitialPaymentStatus.Unpaid,
  })
  initialPaymentStatus: InitialPaymentStatus;

  @Column({
    type: "enum",
    enum: ContractStatus,
    default: ContractStatus.NotSigned,
  })
  contractStatus: ContractStatus;
  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
    name: "television_cost",
  })
  television_cost: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
    name: "bluetooth_speaker_cost",
  })
  bluetooth_speaker_cost: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
    name: "book_cost",
  })
  book_cost: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
    name: "projector_cost",
  })
  projector_cost: number;

  @Column({ type: "boolean", default: false, name: "is_notified" })
  is_notified: boolean;

  @Column({ type: "varchar", length: 255, nullable: true, name: "saleYear" })
  saleYear: string;
}
