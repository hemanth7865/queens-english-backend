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
import { Classes } from "./Classes";
import { User } from "./User";
import { ZoomUser } from "./ZoomUser";
import { UserJoinLinks } from "./UserJoinLinks";

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

  @ManyToOne((type) => ZoomUser, (zoom_user) => zoom_user.meetings)
  @JoinColumn({ name: "user_id", referencedColumnName: "user_id" })
  zoom_user: ZoomUser;

  @OneToOne((type) => Classes, (batch) => batch.meeting)
  @JoinColumn({ name: "batch_id" })
  batch: Classes;

  @OneToMany((type) => Classes, (batch) => batch.meeting)
  @JoinColumn({ name: "id", referencedColumnName: "meeting_id" })
  join_link: UserJoinLinks[];
}
