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

@Entity("zoom_users")
export class ZoomUser extends BaseEntity {
  ZoomUser() {}
  @PrimaryColumn()
  id: string;
  @Column({ type: "text" })
  user_id: string;
  @Column({ type: "text" })
  first_name: string;
  @Column({ type: "text" })
  last_name: string;
  @Column({ type: "text" })
  email: string;
  @Column({ type: "text" })
  zak_token: string;
  @Column({ type: "integer" })
  type: number;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne((type) => User, (user) => user.zoom_user)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany((type) => ZoomMeeting, (ZoomMeeting) => ZoomMeeting.zoom_user)
  @JoinColumn({ name: "user_id", referencedColumnName: "user_id" })
  meetings: ZoomMeeting[];
}
