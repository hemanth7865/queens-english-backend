import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
} from "typeorm";

@Entity("notes")
export class Notes extends BaseEntity {
  Notes() {}
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  schoolId: string;
  @Column()
  eventId: string;
  @Column()
  note: string;
  @Column()
  message: string;
  @Column()
  eventCode: string;
  @Column()
  operation: string;
  @Column()
  userId: string;
  @Column()
  scheduleId: string;
  @CreateDateColumn()
  createdAt: Date;
}
