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
import { ZoomMeeting } from "./ZoomMeeting";

/**
 * Student transaction information
 */

@Entity("users_zoom_links")
export class UserJoinLinks extends BaseEntity {
  UserJoinLinks() {}
  @PrimaryColumn()
  id: string;
  @Column({ type: "text" })
  meeting_id: string;
  @Column({ type: "text" })
  join_url: string;
  @Column({ type: "text" })
  email: string;
  @Column({ type: "text" })
  batch_id: string;
  @Column({ type: "text" })
  registrant_id: string;
  @Column({ type: "date" })
  last_daily_exhausted_error: string;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne((type) => User, (user) => user.join_link)
  @JoinColumn({ name: "id", referencedColumnName: "id" })
  user: User;

  @OneToOne((type) => ZoomMeeting, (ZoomMeeting) => ZoomMeeting.join_link)
  @JoinColumn({ name: "meeting_id", referencedColumnName: "id" })
  meeting: ZoomMeeting;
}
