import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";

@Entity("events")
export class Events extends BaseEntity {
  Events() { }
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  eventName: string;
}
