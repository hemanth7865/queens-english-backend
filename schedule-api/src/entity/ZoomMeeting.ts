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
import { User } from "./User";

/**
 * Student transaction information
 */

@Entity("zoom_meetings")
export class ZoomMeeting extends BaseEntity {
  ZoomMeeting() {}
  @PrimaryColumn()
  id: string;
  @Column({ type: "text" })
  user_id: string;
  @Column({ type: "text" })
  host_id: string;
  @Column({ type: "text" })
  batch_id: string;
  @Column({ type: "text" })
  uuid: string;
  @Column({ type: "text" })
  meeting: string;
  @Column({ type: "text" })
  start_url: string;
  @Column({ type: "text" })
  join_url: string;
  @Column({ type: "text" })
  password: string;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
  // @OneToOne((type) => User, (user) => user.id)
  // @JoinColumn({ name: "user_id" })
  // user: User;
}
