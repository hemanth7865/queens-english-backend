import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";

@Entity("assessment")
export class Assessment extends BaseEntity {
  Assessment() {}

  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  lesson_due: Date;

  @Column({ nullable: true })
  created_at: number;

  @Column({ nullable: true })
  updated_at: number;
}
